<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Freeze variant and customer data into placed orders that were created before snapshots existed.
 * Only missing keys are filled, from the records that still exist today.
 */
return new class extends Migration
{
    private const ITEM_KEYS = ['product_code', 'sku', 'color', 'size'];

    private const CUSTOMER_KEYS = ['name', 'email', 'phone', 'dni', 'address', 'postal_code', 'province', 'locality'];

    public function up(): void
    {
        $this->backfillItems();
        $this->backfillCustomers();
    }

    public function down(): void
    {
        // Snapshot data is not removed: it is the historical record of each order.
    }

    private function placedOrders(Builder $query): Builder
    {
        // A pending order without customer_data is a live cart, not a placed order.
        return $query->whereNotNull('orders.customer_data')->orWhere('orders.status', '!=', 'pending');
    }

    private function backfillItems(): void
    {
        DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->leftJoin('product_variants', 'product_variants.id', '=', 'order_items.product_variant_id')
            ->leftJoin('products', 'products.id', '=', DB::raw('COALESCE(product_variants.product_id, order_items.product_id)'))
            ->leftJoin('product_colors', 'product_colors.id', '=', 'product_variants.product_color_id')
            ->leftJoin('product_sizes', 'product_sizes.id', '=', 'product_variants.product_size_id')
            ->where(fn (Builder $query) => $this->placedOrders($query))
            ->select([
                'order_items.id',
                'order_items.metadata',
                'products.code as product_code',
                'product_variants.sku as sku',
                'product_colors.name as color',
                'product_sizes.name as size',
            ])
            ->orderBy('order_items.id')
            ->chunk(200, function ($items): void {
                foreach ($items as $item) {
                    $metadata = json_decode((string) $item->metadata, true) ?: [];
                    $updated = $metadata;

                    foreach (self::ITEM_KEYS as $key) {
                        if (blank($updated[$key] ?? null) && filled($item->{$key})) {
                            $updated[$key] = $item->{$key};
                        }
                    }

                    if ($updated !== $metadata) {
                        DB::table('order_items')->where('id', $item->id)->update(['metadata' => json_encode($updated)]);
                    }
                }
            });
    }

    private function backfillCustomers(): void
    {
        DB::table('orders')
            ->leftJoin('customers', 'customers.id', '=', 'orders.customer_id')
            ->leftJoin('provinces', 'provinces.id', '=', 'customers.province_id')
            ->leftJoin('localities', 'localities.id', '=', 'customers.locality_id')
            ->whereNotNull('orders.customer_id')
            ->where(fn (Builder $query) => $this->placedOrders($query))
            ->select([
                'orders.id',
                'orders.customer_data',
                'customers.name',
                'customers.email',
                'customers.phone',
                'customers.dni',
                'customers.address',
                'customers.postal_code',
                'provinces.name as province',
                'localities.name as locality',
            ])
            ->orderBy('orders.id')
            ->chunk(200, function ($orders): void {
                foreach ($orders as $order) {
                    $customerData = json_decode((string) $order->customer_data, true) ?: [];
                    $updated = $customerData;

                    foreach (self::CUSTOMER_KEYS as $key) {
                        if (blank($updated[$key] ?? null) && filled($order->{$key})) {
                            $updated[$key] = $order->{$key};
                        }
                    }

                    if ($updated !== $customerData) {
                        DB::table('orders')->where('id', $order->id)->update(['customer_data' => json_encode($updated)]);
                    }
                }
            });
    }
};
