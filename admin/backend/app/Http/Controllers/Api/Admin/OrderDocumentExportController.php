<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Exports\OrderDocumentExport;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\Exports\OrderDocumentData;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Maatwebsite\Excel\Excel as ExcelWriter;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

final class OrderDocumentExportController extends Controller
{
    public function __invoke(Request $request, Order $order): BinaryFileResponse|Response
    {
        $validated = $request->validate([
            'format' => 'required|string|in:xls,xlsx,pdf',
        ]);

        $format = $validated['format'];
        $filename = 'order-' . $order->id . '.' . $format;

        if ($format === 'pdf') {
            return Pdf::loadView('exports.order', OrderDocumentData::make($order))
                ->setPaper('a4')
                ->download($filename);
        }

        $writerType = $format === 'xls' ? ExcelWriter::XLS : ExcelWriter::XLSX;

        return Excel::download(new OrderDocumentExport($order), $filename, $writerType);
    }
}
