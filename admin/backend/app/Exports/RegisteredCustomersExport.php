<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

final class RegisteredCustomersExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping
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
            'DNI',
            'Email',
            'Phone',
            'Address',
            'Postal Code',
            'Province',
            'Locality',
            'Status',
            'Created At',
        ];
    }

    public function map($customer): array
    {
        /** @var Customer $customer */
        return [
            $customer->id,
            $customer->name,
            $customer->dni,
            $customer->email,
            $customer->phone,
            $customer->address,
            $customer->postal_code,
            $customer->province?->name ?? '',
            $customer->locality?->name ?? '',
            $customer->is_active ? 'Active' : 'Inactive',
            $customer->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
