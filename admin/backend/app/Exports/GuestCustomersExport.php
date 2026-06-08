<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\GuestCustomer;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

final class GuestCustomersExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping
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
            'ID',
            'Name',
            'Email',
            'Phone',
            'WhatsApp',
            'CUIT',
            'Address',
            'City',
            'Postal Code',
            'Province',
            'Locality',
            'Bought Wholesale',
            'Bought Retail',
            'Orders Count',
            'Total Spent',
            'Last Order At',
        ];
    }

    public function map($guest): array
    {
        /** @var GuestCustomer $guest */
        return [
            $guest->id,
            $guest->name,
            $guest->email,
            $guest->phone,
            $guest->whatsapp,
            $guest->cuit,
            $guest->address,
            $guest->city,
            $guest->postal_code,
            $guest->province?->name ?? '',
            $guest->locality?->name ?? '',
            $guest->bought_wholesale ? 'Yes' : 'No',
            $guest->bought_retail ? 'Yes' : 'No',
            (int) $guest->orders_count,
            (float) $guest->total_spent,
            $guest->last_order_at?->format('Y-m-d H:i:s'),
        ];
    }
}
