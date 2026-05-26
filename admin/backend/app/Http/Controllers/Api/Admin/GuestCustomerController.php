<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\GuestCustomerResource;
use App\Models\GuestCustomer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GuestCustomerController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = GuestCustomer::query()->with(['province', 'locality']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
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
        $query->orderBy($sortField, $sortOrder);

        $perPage = (int) $request->input('perPage', 10);

        return GuestCustomerResource::collection($query->paginate($perPage));
    }

    public function show(GuestCustomer $guestCustomer): GuestCustomerResource
    {
        $guestCustomer->load(['province', 'locality', 'orders']);
        return new GuestCustomerResource($guestCustomer);
    }

    public function destroy(GuestCustomer $guestCustomer): JsonResponse
    {
        $guestCustomer->delete();
        return response()->json(['message' => 'Guest customer deleted successfully']);
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:guest_customers,id',
        ]);

        GuestCustomer::whereIn('id', $request->ids)->delete();

        return response()->json(['message' => 'Guest customers deleted successfully']);
    }
}
