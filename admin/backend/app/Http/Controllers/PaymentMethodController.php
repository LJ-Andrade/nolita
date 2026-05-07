<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use App\Http\Resources\PaymentMethodResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\StorefrontRevalidationService;

class PaymentMethodController extends Controller
{
    public function __construct(private StorefrontRevalidationService $storefrontRevalidation)
    {
    }

    public function index(Request $request)
    {
        $query = PaymentMethod::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        } elseif (!$request->user()) {
            $query->where('status', 'active');
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $allowedSortBy = ['id', 'name', 'created_at'];
        if (in_array($sortBy, $allowedSortBy)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        return PaymentMethodResource::collection($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'fee' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['fee'] = $request->input('fee', 0);

        $paymentMethod = PaymentMethod::create($data);

        $this->revalidateCheckoutMethods();

        return new PaymentMethodResource($paymentMethod);
    }

    public function show(PaymentMethod $paymentMethod)
    {
        return new PaymentMethodResource($paymentMethod);
    }

    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'fee' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['fee'] = $request->input('fee', 0);

        $paymentMethod->update($data);

        $this->revalidateCheckoutMethods();

        return new PaymentMethodResource($paymentMethod);
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        $paymentMethod->delete();

        $this->revalidateCheckoutMethods();

        return response()->noContent();
    }

    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:payment_methods,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $ids = $request->input('ids');
        PaymentMethod::whereIn('id', $ids)->delete();

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
