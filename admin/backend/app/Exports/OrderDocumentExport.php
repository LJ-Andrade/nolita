<?php

declare(strict_types=1);

namespace App\Exports;

use App\Models\Order;
use App\Support\Exports\OrderDocumentData;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

final class OrderDocumentExport implements FromView, ShouldAutoSize
{
    public function __construct(
        private readonly Order $order,
    ) {}

    public function view(): View
    {
        return view('exports.order', OrderDocumentData::make($this->order));
    }
}
