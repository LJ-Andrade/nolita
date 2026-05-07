<?php

namespace App\Http\Controllers;

use App\Models\DeliveryMethod;
use App\Http\Resources\DeliveryMethodResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\StorefrontRevalidationService;

class DeliveryMethodController extends Controller
{
    public function __construct(private StorefrontRevalidationService $storefrontRevalidation)
    {
    }

    public function index(Request $request)
    {
        $query = DeliveryMethod::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $allowedSortBy = ['id', 'name', 'created_at'];
        if (in_array($sortBy, $allowedSortBy)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        return DeliveryMethodResource::collection($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'fee' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $deliveryMethod = DeliveryMethod::create($data);

        $this->revalidateCheckoutMethods();

        return new DeliveryMethodResource($deliveryMethod);
    }

    public function show(DeliveryMethod $deliveryMethod)
    {
        return new DeliveryMethodResource($deliveryMethod);
    }

    public function update(Request $request, DeliveryMethod $deliveryMethod)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'fee' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $deliveryMethod->update($data);

        $this->revalidateCheckoutMethods();

        return new DeliveryMethodResource($deliveryMethod);
    }

    public function destroy(DeliveryMethod $deliveryMethod)
    {
        $deliveryMethod->delete();

        $this->revalidateCheckoutMethods();

        return response()->noContent();
    }

    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:delivery_methods,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $ids = $request->input('ids');
        DeliveryMethod::whereIn('id', $ids)->delete();

        $this->revalidateCheckoutMethods();

        return response()->noContent();
    }

    private function revalidateCheckoutMethods(): void
    {
        $this->storefrontRevalidation->revalidate([
            StorefrontRevalidationService::CHECKOUT_METHODS,
        ], ['/checkout']);
    }
}
