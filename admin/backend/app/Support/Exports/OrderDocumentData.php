<?php

declare(strict_types=1);

namespace App\Support\Exports;

use App\Models\Order;
use App\Support\Localization\Translator;

final class OrderDocumentData
{
    public static function make(Order $order): array
    {
        $order->loadMissing([
            'customer.province',
            'customer.locality',
            'items.variant.color',
            'items.variant.size',
            'items.variant.product',
            'items.product',
        ]);

        $shippingAddress = self::arrayValue($order->shipping_address);
        $billingAddress = self::arrayValue($order->billing_address);
        $customerData = self::arrayValue($order->customer_data);
        $customer = $order->customer;

        $items = $order->items->map(function ($item): array {
            return [
                'product_name' => $item->product_name,
                'product_id' => $item->product_id,
                'product_code' => $item->product_code,
                'color' => $item->variant?->color?->name,
                'size' => $item->variant?->size?->name,
                'sku' => $item->variant?->sku,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'subtotal' => (float) $item->subtotal,
            ];
        });

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
                'notes' => $order->notes,
            ],
            'customer' => [
                'id' => $customer?->id,
                'name' => $customer?->name ?? $customerData['name'] ?? $shippingAddress['name'] ?? null,
                'dni' => $customer?->dni,
                'cuit' => $customerData['cuit'] ?? $shippingAddress['cuit'] ?? $billingAddress['cuit'] ?? null,
                'dni_or_cuit' => $customerData['cuit'] ?? $shippingAddress['cuit'] ?? $billingAddress['cuit'] ?? $customer?->dni,
                'email' => $customer?->email ?? $customerData['email'] ?? $shippingAddress['email'] ?? null,
                'phone' => $customer?->phone ?? $customerData['phone'] ?? $shippingAddress['phone'] ?? null,
                'address' => $customer?->address ?? $customerData['address'] ?? $shippingAddress['address'] ?? null,
                'postal_code' => $customer?->postal_code ?? $customerData['postal_code'] ?? $shippingAddress['postal_code'] ?? null,
                'province' => $customer?->province?->name ?? $customerData['province'] ?? $shippingAddress['province'] ?? null,
                'locality' => $customer?->locality?->name ?? $customerData['locality'] ?? $customerData['city'] ?? $shippingAddress['locality'] ?? $shippingAddress['city'] ?? null,
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
                'subtotal' => $subtotal,
                'discount' => $discount,
                'delivery_fee' => $deliveryFee,
                'payment_fee' => $paymentFee,
                'total' => (float) $order->total_amount,
            ],
            'generated_at' => now(),
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
