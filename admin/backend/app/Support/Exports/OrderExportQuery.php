<?php

declare(strict_types=1);

namespace App\Support\Exports;

use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

final class OrderExportQuery
{
    public static function fromRequest(Request $request): Builder
    {
        $query = Order::query()
            ->with('customer')
            ->latest();

        $search = trim((string) $request->input('search', ''));
        $priceMode = $request->input('price_mode');
        $status = $request->input('status');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        if ($search !== '') {
            $query->where(function (Builder $query) use ($search): void {
                $query
                    ->where('id', 'like', "%{$search}%")
                    ->orWhereHas('customer', function (Builder $query) use ($search): void {
                        $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if (in_array($priceMode, ['retail', 'wholesale'], true)) {
            $query->where('price_mode', $priceMode);
        }

        if (in_array($status, ['pending', 'processing', 'completed', 'cancelled'], true)) {
            $query->where('status', $status);
        }

        if (filled($dateFrom)) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if (filled($dateTo)) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        return $query;
    }
}
