<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Owns every stock movement tied to an order's lifecycle.
 * `orders.stock_deducted_at` tells whether the order currently holds its line-item stock.
 */
final class OrderStockService
{
    /**
     * @return array{order: Order, message: string, stock_action: 'restored'|'deducted'|null}
     */
    public function transitionStatus(Order $order, string $newStatus): array
    {
        return DB::transaction(function () use ($order, $newStatus): array {
            $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->getKey());
            $previousStatus = $lockedOrder->status;
            $stockAction = null;
            $message = 'Estado actualizado correctamente.';

            if ($previousStatus === $newStatus) {
                return ['order' => $lockedOrder, 'message' => $message, 'stock_action' => null];
            }

            if ($newStatus === Order::STATUS_CANCELLED) {
                if ($lockedOrder->hasDeductedStock()) {
                    $this->restore($lockedOrder);
                    $stockAction = 'restored';
                    $message = 'Pedido cancelado. El stock fue devuelto.';
                }
            } elseif (
                ! $lockedOrder->hasDeductedStock()
                && ($newStatus === Order::STATUS_COMPLETED || $previousStatus === Order::STATUS_CANCELLED)
            ) {
                $this->deduct($lockedOrder);
                $stockAction = 'deducted';
                $message = 'Estado actualizado correctamente. Se descontó el stock del pedido.';
            }

            $lockedOrder->forceFill(['status' => $newStatus])->save();

            return ['order' => $lockedOrder->fresh(), 'message' => $message, 'stock_action' => $stockAction];
        });
    }

    /**
     * Subtract the order's line-item quantities from stock inside the caller's transaction.
     *
     * @throws ValidationException when any variant lacks stock
     */
    public function deduct(Order $order): void
    {
        if ($order->hasDeductedStock()) {
            return;
        }

        $items = $order->items()->get();
        $quantities = $this->variantQuantities($items);
        $variants = $this->lockVariants($quantities->keys()->all());

        $shortages = $items
            ->whereNull('product_variant_id')
            ->map(fn (OrderItem $item): string => $this->shortageDescription($item, (int) $item->quantity, 0))
            ->values()
            ->all();

        foreach ($quantities as $variantId => $quantity) {
            $available = (int) ($variants->get($variantId)?->stock ?? 0);

            if ($available < $quantity) {
                $shortages[] = $this->shortageDescription(
                    $items->firstWhere('product_variant_id', $variantId),
                    $quantity,
                    $available,
                );
            }
        }

        if ($shortages !== []) {
            throw ValidationException::withMessages([
                'status' => ['No hay stock suficiente: '.implode('; ', $shortages).'.'],
            ]);
        }

        foreach ($quantities as $variantId => $quantity) {
            $variants->get($variantId)->decrement('stock', $quantity);
        }

        $order->forceFill(['stock_deducted_at' => now()])->save();
    }

    /**
     * Return the order's deducted quantities to stock inside the caller's transaction.
     */
    public function restore(Order $order): void
    {
        if (! $order->hasDeductedStock()) {
            return;
        }

        $quantities = $this->variantQuantities($order->items()->get());
        $variants = $this->lockVariants($quantities->keys()->all());

        foreach ($quantities as $variantId => $quantity) {
            // Variants deleted after the sale no longer exist to receive stock.
            $variants->get($variantId)?->increment('stock', $quantity);
        }

        $order->forceFill(['stock_deducted_at' => null])->save();
    }

    /**
     * @param  array<int>  $orderIds
     * @return array<int> deleted order ids
     */
    public function deleteOrders(array $orderIds): array
    {
        return DB::transaction(function () use ($orderIds): array {
            $orders = Order::query()
                ->whereIn('id', $orderIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            foreach ($orders as $order) {
                // Completed orders were delivered, so deleting the record must not return stock.
                if ($order->status !== Order::STATUS_COMPLETED) {
                    $this->restore($order);
                }

                $order->delete();
            }

            return $orders->pluck('id')->all();
        });
    }

    /**
     * @param  Collection<int, OrderItem>  $items
     * @return Collection<int, int>
     */
    private function variantQuantities(Collection $items): Collection
    {
        return $items
            ->whereNotNull('product_variant_id')
            ->groupBy('product_variant_id')
            ->map(fn (Collection $variantItems): int => (int) $variantItems->sum('quantity'));
    }

    /**
     * @param  array<int>  $variantIds
     * @return Collection<int, ProductVariant>
     */
    private function lockVariants(array $variantIds): Collection
    {
        if ($variantIds === []) {
            return collect();
        }

        return ProductVariant::query()
            ->whereIn('id', $variantIds)
            ->orderBy('id')
            ->lockForUpdate()
            ->get()
            ->keyBy('id');
    }

    private function shortageDescription(?OrderItem $item, int $required, int $available): string
    {
        $label = $item?->product_name ?? 'Producto eliminado';

        if ($item?->variant_label) {
            $label .= " ({$item->variant_label})";
        }

        return sprintf('%s necesita %d y hay %d', $label, $required, $available);
    }
}
