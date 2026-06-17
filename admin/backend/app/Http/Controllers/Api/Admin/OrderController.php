<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Customer;
use App\Models\DeliveryMethod;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Support\Exports\OrderExportQuery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = OrderExportQuery::fromRequest($request);

        $perPage = $request->input('perPage', 10);
        return response()->json($query->paginate($perPage));
    }

    public function options()
    {
        $customers = Customer::query()
            ->with(['province', 'locality'])
            ->orderBy('name')
            ->limit(200)
            ->get()
            ->map(fn (Customer $customer): array => [
                'id' => $customer->id,
                'name' => $customer->name,
                'dni' => $customer->dni,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'address' => $customer->address,
                'postal_code' => $customer->postal_code,
                'province_id' => $customer->province_id,
                'province' => $customer->province?->name,
                'locality_id' => $customer->locality_id,
                'locality' => $customer->locality?->name,
            ]);

        $products = Product::query()
            ->with(['variants.color', 'variants.size'])
            ->where('status', '!=', 'archived')
            ->orderBy('name')
            ->get()
            ->map(fn (Product $product): array => [
                'id' => $product->id,
                'name' => $product->name,
                'code' => $product->code,
                'sale_price' => (float) $product->sale_price,
                'wholesale_price' => $product->wholesale_price !== null ? (float) $product->wholesale_price : null,
                'discount' => (float) ($product->discount ?? 0),
                'wholesale_discount' => (float) ($product->wholesale_discount ?? 0),
                'hide_on_wholesale' => (bool) $product->hide_on_wholesale,
                'variants' => $product->variants
                    ->filter(fn (ProductVariant $variant): bool => (bool) $variant->active)
                    ->values()
                    ->map(fn (ProductVariant $variant): array => [
                        'id' => $variant->id,
                        'product_id' => $variant->product_id,
                        'sku' => $variant->sku,
                        'stock' => (int) $variant->stock,
                        'color' => $variant->color?->name,
                        'size' => $variant->size?->name,
                    ]),
            ])
            ->filter(fn (array $product): bool => $product['variants']->isNotEmpty())
            ->values();

        return response()->json([
            'customers' => $customers,
            'products' => $products,
            'delivery_methods' => DeliveryMethod::query()->orderBy('name')->get(['id', 'name', 'fee', 'price_mode_scope']),
            'payment_methods' => PaymentMethod::query()
                ->where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name', 'fee', 'price_mode_scope']),
        ]);
    }

    public function show(Order $order)
    {
        return response()->json($order->load([
            'customer',
            'items.product',
            'items.variant.product',
            'items.variant.color',
            'items.variant.size',
        ]));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'status' => ['required', Rule::in(['pending', 'processing', 'completed', 'cancelled'])],
            'price_mode' => ['required', Rule::in(['retail', 'wholesale'])],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'whatsapp' => ['nullable', 'string', 'max:50'],
            'cuit' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:1000'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'province_id' => ['nullable', 'integer', 'exists:provinces,id'],
            'province' => ['nullable', 'string', 'max:255'],
            'locality_id' => ['nullable', 'integer', 'exists:localities,id'],
            'locality' => ['nullable', 'string', 'max:255'],
            'delivery_method_id' => ['required', 'integer', 'exists:delivery_methods,id'],
            'payment_method_id' => [
                'required',
                'integer',
                Rule::exists('payment_methods', 'id')->where('status', 'active'),
            ],
            'coupon_code' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.product_variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'lines.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $customer = Customer::with(['province', 'locality'])->findOrFail($validated['customer_id']);
        $deliveryMethod = DeliveryMethod::query()
            ->forPriceMode($validated['price_mode'])
            ->findOrFail($validated['delivery_method_id']);
        $paymentMethod = PaymentMethod::query()
            ->where('status', 'active')
            ->forPriceMode($validated['price_mode'])
            ->findOrFail($validated['payment_method_id']);
        $pricedLines = $this->buildPricedLines($validated['lines'], $validated['price_mode']);

        if (empty($pricedLines)) {
            return response()->json(['message' => 'El pedido debe tener al menos un producto disponible.'], 422);
        }

        $subtotal = collect($pricedLines)->sum('subtotal');
        $couponDiscountAmount = 0;
        $appliedCouponCode = null;
        $couponCode = trim((string) ($validated['coupon_code'] ?? ''));

        if ($couponCode !== '') {
            $coupon = Coupon::whereRaw('LOWER(code) = ?', [strtolower($couponCode)])->first();

            if (!$coupon || !$coupon->isValidForCheckout($validated['price_mode'])) {
                return response()->json(['message' => 'Cupón inválido o vencido.'], 422);
            }

            $couponDiscountAmount = $coupon->discountForSubtotal($subtotal);
            $appliedCouponCode = $coupon->code;
        }

        try {
            $order = DB::transaction(function () use (
                $validated,
                $customer,
                $deliveryMethod,
                $paymentMethod,
                $pricedLines,
                $subtotal,
                $couponDiscountAmount,
                $appliedCouponCode
            ): Order {
                if ($validated['status'] === 'completed') {
                    foreach ($pricedLines as $line) {
                        $variant = ProductVariant::whereKey($line['variant_id'])->lockForUpdate()->firstOrFail();
                        if ($variant->stock < $line['quantity']) {
                            throw new \RuntimeException("No hay stock suficiente para {$line['product_name']}.");
                        }
                        $variant->decrement('stock', $line['quantity']);
                    }
                }

                $customerData = [
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'] ?? null,
                    'whatsapp' => $validated['whatsapp'] ?? null,
                    'cuit' => $validated['cuit'] ?? null,
                    'address' => $validated['address'] ?? null,
                    'postal_code' => $validated['postal_code'] ?? null,
                    'province_id' => $validated['province_id'] ?? $customer->province_id,
                    'province' => $validated['province'] ?? $customer->province?->name,
                    'locality_id' => $validated['locality_id'] ?? $customer->locality_id,
                    'locality' => $validated['locality'] ?? $customer->locality?->name,
                ];

                $deliveryFee = (float) $deliveryMethod->fee;
                $paymentFee = $this->calculatePaymentFee($subtotal, $couponDiscountAmount, $paymentMethod);
                $total = max(max($subtotal - $couponDiscountAmount, 0) + $paymentFee, 0) + $deliveryFee;

                $order = Order::create([
                    'customer_id' => $customer->id,
                    'status' => $validated['status'],
                    'payment_status' => 'unpaid',
                    'total_amount' => $total,
                    'currency' => 'ARS',
                    'price_mode' => $validated['price_mode'],
                    'payment_method' => (string) $paymentMethod->id,
                    'coupon_code' => $appliedCouponCode,
                    'coupon_discount_amount' => $couponDiscountAmount,
                    'customer_data' => $customerData,
                    'shipping_address' => array_merge($customerData, [
                        'delivery_method_id' => (string) $deliveryMethod->id,
                        'delivery_method_name' => $deliveryMethod->name,
                        'delivery_fee' => $deliveryFee,
                    ]),
                    'billing_address' => array_merge($customerData, [
                        'payment_method_id' => (string) $paymentMethod->id,
                        'payment_method_name' => $paymentMethod->name,
                        'payment_fee' => $paymentFee,
                    ]),
                    'notes' => $validated['notes'] ?? null,
                ]);

                foreach ($pricedLines as $line) {
                    $order->items()->create([
                        'product_id' => $line['product_id'],
                        'product_variant_id' => $line['variant_id'],
                        'product_name' => $line['product_name'],
                        'quantity' => $line['quantity'],
                        'unit_price' => $line['unit_price'],
                        'subtotal' => $line['subtotal'],
                    ]);
                }

                return $order->fresh([
                    'customer',
                    'items.variant.color',
                    'items.variant.size',
                ]);
            });
        } catch (\RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json($order, 201);
    }

    public function update(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'sometimes|string|in:pending,processing,completed,cancelled',
            'payment_status' => 'sometimes|string|in:unpaid,processing,paid',
        ]);

        $order->update($request->only('status', 'payment_status'));

        return response()->json($order);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:orders,id',
        ]);

        Order::whereIn('id', $request->ids)->delete();

        return response()->json(['message' => 'Orders deleted successfully']);
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return response()->json(['message' => 'Order deleted successfully']);
    }

    private function buildPricedLines(array $lines, string $priceMode): array
    {
        $groupedLines = collect($lines)
            ->groupBy('product_variant_id')
            ->map(fn ($items, $variantId): array => [
                'variant_id' => (int) $variantId,
                'quantity' => collect($items)->sum('quantity'),
            ])
            ->values();

        $variants = ProductVariant::query()
            ->with('product')
            ->whereIn('id', $groupedLines->pluck('variant_id'))
            ->get()
            ->keyBy('id');

        return $groupedLines
            ->map(function (array $line) use ($variants, $priceMode): ?array {
                $variant = $variants->get($line['variant_id']);
                $unitPrice = $this->variantUnitPrice($variant, $priceMode);

                if (!$variant || !$variant->product || $unitPrice <= 0) {
                    return null;
                }

                return [
                    'variant_id' => (int) $variant->id,
                    'product_id' => (int) $variant->product_id,
                    'product_name' => $variant->product->name,
                    'quantity' => (int) $line['quantity'],
                    'unit_price' => $unitPrice,
                    'subtotal' => round($unitPrice * (int) $line['quantity'], 2),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function variantUnitPrice(?ProductVariant $variant, string $priceMode): float
    {
        if (!$variant || !$variant->product) {
            return 0.0;
        }

        $originalPrice = $priceMode === 'wholesale'
            ? round((float) ($variant->product->wholesale_price ?? 0), 2)
            : round((float) $variant->product->sale_price, 2);
        $discount = $priceMode === 'wholesale'
            ? (float) ($variant->product->wholesale_discount ?? 0)
            : (float) ($variant->product->discount ?? 0);

        if ($discount <= 0) {
            return $originalPrice;
        }

        return round($originalPrice * (1 - (min($discount, 100) / 100)), 2);
    }

    private function calculatePaymentFee(float $subtotal, float $couponDiscountAmount, PaymentMethod $paymentMethod): float
    {
        $paymentPercent = (float) $paymentMethod->fee;
        $base = max($subtotal - $couponDiscountAmount, 0);

        return round($base * $paymentPercent / 100, 2);
    }
}
