<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\Exports\OrderExportQuery;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = OrderExportQuery::fromRequest($request);

        $perPage = $request->input('perPage', 10);
        return response()->json($query->paginate($perPage));
    }

    public function show(Order $order)
    {
        return response()->json($order->load([
            'customer',
            'items.variant.color',
            'items.variant.size',
        ]));
    }

    public function update(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|string|in:pending,processing,completed,cancelled',
        ]);

        $order->update([
            'status' => $request->status,
        ]);

        return response()->json($order);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:orders,id',
        ]);

        Order::whereIn('id', $request->ids)->delete();

        return response()->json(['message' => 'Orders deleted successfully']);
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return response()->json(['message' => 'Order deleted successfully']);
    }
}
