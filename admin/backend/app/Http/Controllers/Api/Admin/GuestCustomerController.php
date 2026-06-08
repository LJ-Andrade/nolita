<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\GuestCustomerResource;
use App\Models\GuestCustomer;
use App\Support\Exports\CustomerExportQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GuestCustomerController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = CustomerExportQuery::guestsFromRequest($request);

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
