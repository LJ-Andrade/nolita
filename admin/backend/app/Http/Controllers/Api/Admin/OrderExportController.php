<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Exports\OrdersExport;
use App\Http\Controllers\Controller;
use App\Support\Exports\OrderExportQuery;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

final class OrderExportController extends Controller
{
    public function __invoke(Request $request): BinaryFileResponse|Response
    {
        $validated = $request->validate([
            'format' => 'required|string|in:xlsx,csv,pdf',
            'search' => 'nullable|string|max:255',
        ]);

        $format = $validated['format'];
        $filename = 'orders-' . now()->format('Y-m-d-His') . '.' . $format;
        $query = OrderExportQuery::fromRequest($request);

        if ($format === 'pdf') {
            $orders = $query
                ->withCount('items')
                ->get();

            return Pdf::loadView('exports.orders', [
                'orders' => $orders,
                'generatedAt' => now(),
                'search' => $request->input('search'),
            ])->download($filename);
        }

        return Excel::download(new OrdersExport($query), $filename);
    }
}
