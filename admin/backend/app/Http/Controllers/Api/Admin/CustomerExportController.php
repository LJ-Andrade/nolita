<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Exports\GuestCustomersExport;
use App\Exports\RegisteredCustomersExport;
use App\Http\Controllers\Controller;
use App\Support\Exports\CustomerExportQuery;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

final class CustomerExportController extends Controller
{
    public function registered(Request $request): BinaryFileResponse|Response
    {
        $validated = $request->validate([
            'format' => 'required|string|in:xlsx,pdf',
            'search' => 'nullable|string|max:255',
        ]);

        $format = $validated['format'];
        $query = CustomerExportQuery::registeredFromRequest($request);
        $filename = 'registered-customers-' . now()->format('Y-m-d-His') . '.' . $format;

        if ($format === 'pdf') {
            return Pdf::loadView('exports.customers', [
                'customers' => $query->get(),
                'type' => 'registered',
                'title' => 'Clientes registrados',
                'generatedAt' => now(),
                'filters' => [
                    'search' => $request->input('search'),
                ],
            ])->download($filename);
        }

        return Excel::download(new RegisteredCustomersExport($query), $filename);
    }

    public function guests(Request $request): BinaryFileResponse|Response
    {
        $validated = $request->validate([
            'format' => 'required|string|in:xlsx,pdf',
            'search' => 'nullable|string|max:255',
            'price_mode' => 'nullable|string|in:retail,wholesale',
        ]);

        $format = $validated['format'];
        $query = CustomerExportQuery::guestsFromRequest($request);
        $filename = 'guest-customers-' . now()->format('Y-m-d-His') . '.' . $format;

        if ($format === 'pdf') {
            return Pdf::loadView('exports.customers', [
                'customers' => $query->get(),
                'type' => 'guest',
                'title' => 'Clientes invitados',
                'generatedAt' => now(),
                'filters' => [
                    'search' => $request->input('search'),
                    'price_mode' => $request->input('price_mode'),
                ],
            ])->download($filename);
        }

        return Excel::download(new GuestCustomersExport($query), $filename);
    }
}
