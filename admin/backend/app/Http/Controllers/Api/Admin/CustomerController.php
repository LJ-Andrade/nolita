<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Http\Requests\Admin\CustomerRequest;
use App\Http\Resources\Admin\CustomerResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Customer::query()->with(['province', 'locality']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('dni', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('postal_code', 'like', "%{$search}%");
            });
        }

        $sortField = $request->input('sortField', 'created_at');
        $sortOrder = $request->input('sortOrder', 'desc');
        $query->orderBy($sortField, $sortOrder);

        $perPage = $request->input('perPage', 10);
        
        return CustomerResource::collection($query->paginate($perPage));
    }

    public function store(CustomerRequest $request): CustomerResource
    {
        $customer = Customer::create($request->validated());

        if ($request->hasFile('avatar')) {
            $customer->addMediaFromRequest('avatar')->toMediaCollection('avatar');
        }

        return new CustomerResource($customer);
    }

    public function show(Customer $customer): CustomerResource
    {
        $customer->load(['province', 'locality']);
        return new CustomerResource($customer);
    }

    public function update(CustomerRequest $request, Customer $customer): CustomerResource
    {
        $data = $request->validated();
        if (empty($data['password'])) {
            unset($data['password']);
        }
        
        $customer->update($data);

        if ($request->hasFile('avatar')) {
            $customer->addMediaFromRequest('avatar')->toMediaCollection('avatar');
        }

        return new CustomerResource($customer);
    }

    public function uploadAvatar(Request $request, Customer $customer): CustomerResource
    {
        $request->validate([
            'avatar' => 'required|image|max:2048',
        ]);

        $customer->addMediaFromRequest('avatar')->toMediaCollection('avatar');

        return new CustomerResource($customer);
    }

    public function destroy(Customer $customer): \Illuminate\Http\JsonResponse
    {
        $customer->delete();
        return response()->json(['message' => 'Customer deleted successfully']);
    }

    public function bulkDelete(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:customers,id'
        ]);

        Customer::whereIn('id', $request->ids)->delete();

        return response()->json(['message' => 'Customers deleted successfully']);
    }
}
