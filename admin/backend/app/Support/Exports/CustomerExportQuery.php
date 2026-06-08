<?php

declare(strict_types=1);

namespace App\Support\Exports;

use App\Models\Customer;
use App\Models\GuestCustomer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

final class CustomerExportQuery
{
    public static function registeredFromRequest(Request $request): Builder
    {
        $query = Customer::query()->with(['province', 'locality']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function (Builder $q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('dni', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('postal_code', 'like', "%{$search}%");
            });
        }

        $allowedSorts = ['created_at', 'name', 'email', 'dni'];
        $sortField = $request->input('sortField', 'created_at');
        if (!in_array($sortField, $allowedSorts, true)) {
            $sortField = 'created_at';
        }

        $sortOrder = strtolower((string) $request->input('sortOrder', 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortField, $sortOrder);
    }

    public static function guestsFromRequest(Request $request): Builder
    {
        $query = GuestCustomer::query()->with(['province', 'locality']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function (Builder $q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('whatsapp', 'like', "%{$search}%")
                    ->orWhere('cuit', 'like', "%{$search}%");
            });
        }

        $priceMode = $request->input('price_mode');
        if ($priceMode === 'wholesale') {
            $query->where('bought_wholesale', true);
        } elseif ($priceMode === 'retail') {
            $query->where('bought_retail', true);
        }

        $allowedSorts = ['created_at', 'last_order_at', 'orders_count', 'total_spent', 'name', 'email'];
        $sortField = $request->input('sortField', 'last_order_at');
        if (!in_array($sortField, $allowedSorts, true)) {
            $sortField = 'last_order_at';
        }

        $sortOrder = strtolower((string) $request->input('sortOrder', 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortField, $sortOrder);
    }
}
