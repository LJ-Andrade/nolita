<?php

declare(strict_types=1);

namespace App\Support\Exports;

use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

final class OrderExportQuery
{
    /**
     * Customer snapshot fields stored in the `customer_data` JSON column at checkout.
     */
    private const CUSTOMER_DATA_FIELDS = ['name', 'email', 'phone', 'whatsapp', 'cuit', 'city', 'locality'];

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
            self::applySearch($query, $search);
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

    private static function applySearch(Builder $query, string $search): void
    {
        $orderId = ltrim($search, '#');
        $like = '%'.mb_strtolower(addcslashes($search, '\\%_')).'%';

        $query->where(function (Builder $query) use ($orderId, $like): void {
            if ($orderId !== '' && ctype_digit($orderId)) {
                $query->orWhere('id', (int) $orderId);
            }

            foreach (self::CUSTOMER_DATA_FIELDS as $field) {
                $query->orWhereRaw(
                    "LOWER(JSON_UNQUOTE(JSON_EXTRACT(customer_data, '$.\"{$field}\"'))) LIKE ?",
                    [$like]
                );
            }

            $query
                ->orWhereHas('customer', function (Builder $query) use ($like): void {
                    $query
                        ->whereRaw('LOWER(name) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(email) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(phone) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(dni) LIKE ?', [$like]);
                })
                ->orWhereHas('guestCustomer', function (Builder $query) use ($like): void {
                    $query
                        ->whereRaw('LOWER(name) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(email) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(phone) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(whatsapp) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(cuit) LIKE ?', [$like]);
                });
        });
    }
}
