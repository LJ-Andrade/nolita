<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

final class OrdersExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping
{
    public function __construct(
        private readonly Builder $query,
    ) {}

    public function query(): Builder
    {
        return $this->query;
    }

    public function headings(): array
    {
        return [
            'Order ID',
            'Created At',
            'Status',
            'Customer',
            'Email',
            'Phone',
            'Payment Method',
            'Coupon Code',
            'Coupon Discount',
            'Total',
            'Currency',
            'Notes',
        ];
    }

    public function map($order): array
    {
        /** @var Order $order */
        $shippingAddress = is_array($order->shipping_address) ? $order->shipping_address : [];

        return [
            $order->id,
            $order->created_at?->format('Y-m-d H:i:s'),
            $order->status,
            $order->customer?->name ?? $shippingAddress['name'] ?? '',
            $order->customer?->email ?? $shippingAddress['email'] ?? '',
            $order->customer?->phone ?? $shippingAddress['phone'] ?? '',
            $order->payment_method ?? '',
            $order->coupon_code ?? '',
            (float) ($order->coupon_discount_amount ?? 0),
            (float) $order->total_amount,
            $order->currency,
            $order->notes ?? '',
        ];
    }
}
