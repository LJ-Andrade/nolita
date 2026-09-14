<?php

declare(strict_types=1);

namespace App\Support\Exports;

use App\Models\Order;
use App\Support\Localization\Translator;

final class OrderDocumentData
{
    public static function make(Order $order): array
    {
        // Documents are built only from the order snapshot, never from live product or customer records.
        $order->loadMissing('items');

        $shippingAddress = self::arrayValue($order->shipping_address);
        $billingAddress = self::arrayValue($order->billing_address);
        $customerData = $order->customerSnapshot();

        $items = $order->items->map(function ($item): array {
            return [
                'product_name' => $item->product_name,
                'product_code' => $item->product_code,
                'variant' => $item->variant_label ?? '',
                'sku' => $item->sku,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'subtotal' => (float) $item->subtotal,
            ];
        });

        $totalQuantity = (int) $items->sum('quantity');
        $subtotal = (float) $items->sum('subtotal');
        $discount = (float) ($order->coupon_discount_amount ?? 0);
        $deliveryFee = (float) ($shippingAddress['delivery_fee'] ?? 0);
        $paymentFee = (float) ($billingAddress['payment_fee'] ?? 0);

        return [
            'order' => [
                'id' => $order->id,
                'status' => $order->status,
                'status_label' => Translator::orderStatus($order->status),
                'price_mode' => $order->price_mode,
                'order_type_label' => self::orderTypeLabel($order->price_mode),
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
                'payment_method' => $billingAddress['payment_method_name'] ?? $order->payment_method,
                'payment_method_label' => Translator::paymentMethod($billingAddress['payment_method_name'] ?? $order->payment_method),
                'delivery_method' => $shippingAddress['delivery_method_name'] ?? $shippingAddress['delivery_method_id'] ?? null,
                'coupon_code' => $order->coupon_code,
                'currency' => $order->currency,
            ],
            'customer' => [
                'id' => $order->customer_id,
                'name' => $customerData['name'] ?? null,
                'dni' => $customerData['dni'] ?? null,
                'cuit' => $customerData['cuit'] ?? $billingAddress['cuit'] ?? null,
                'dni_or_cuit' => $customerData['cuit'] ?? $billingAddress['cuit'] ?? $customerData['dni'] ?? null,
                'email' => $customerData['email'] ?? null,
                'phone' => $customerData['phone'] ?? null,
                'address' => $customerData['address'] ?? null,
                'postal_code' => $customerData['postal_code'] ?? null,
                'province' => $customerData['province'] ?? null,
                'locality' => $customerData['locality'] ?? $customerData['city'] ?? null,
            ],
            'shipping' => [
                'name' => $shippingAddress['name'] ?? null,
                'email' => $shippingAddress['email'] ?? null,
                'phone' => $shippingAddress['phone'] ?? null,
                'address' => $shippingAddress['address'] ?? null,
                'province' => $shippingAddress['province'] ?? null,
                'locality' => $shippingAddress['locality'] ?? $shippingAddress['city'] ?? null,
                'postal_code' => $shippingAddress['postal_code'] ?? null,
                'delivery_fee' => $deliveryFee,
            ],
            'billing' => [
                'name' => $billingAddress['name'] ?? null,
                'email' => $billingAddress['email'] ?? null,
                'phone' => $billingAddress['phone'] ?? null,
                'address' => $billingAddress['address'] ?? null,
                'province' => $billingAddress['province'] ?? null,
                'locality' => $billingAddress['locality'] ?? $billingAddress['city'] ?? null,
                'postal_code' => $billingAddress['postal_code'] ?? null,
                'payment_fee' => $paymentFee,
            ],
            'items' => $items,
            'totals' => [
                'quantity' => $totalQuantity,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'delivery_fee' => $deliveryFee,
                'payment_fee' => $paymentFee,
                'total' => (float) $order->total_amount,
            ],
        ];
    }

    private static function arrayValue(mixed $value): array
    {
        return is_array($value) ? $value : [];
    }

    private static function orderTypeLabel(?string $priceMode): string
    {
        return $priceMode === 'wholesale' ? 'Mayorista' : 'Minorista';
    }
}
