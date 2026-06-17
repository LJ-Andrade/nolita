<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LocalityRequest;
use App\Http\Resources\Admin\LocalityResource;
use App\Models\Locality;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LocalityController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Locality::query()->with('province');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('province_id')) {
            $query->where('province_id', $request->input('province_id'));
        }

        if ($request->filled('id')) {
            $query->where('id', $request->input('id'));
        }

        $sortField = $request->input('sortField', 'name');
        $sortOrder = $request->input('sortOrder', 'asc');
        $query->orderBy($sortField, $sortOrder);

        $perPage = $request->input('perPage', 15);
        
        return LocalityResource::collection($query->paginate($perPage));
    }

    public function store(LocalityRequest $request): LocalityResource
    {
        $locality = Locality::create($request->validated());
        $locality->load('province');
        return new LocalityResource($locality);
    }

    public function show(Locality $locality): LocalityResource
    {
        $locality->load('province');
        return new LocalityResource($locality);
    }

    public function update(LocalityRequest $request, Locality $locality): LocalityResource
    {
        $locality->update($request->validated());
        $locality->load('province');
        return new LocalityResource($locality);
    }

    public function destroy(Locality $locality): \Illuminate\Http\JsonResponse
    {
        $locality->delete();
        return response()->json(['message' => 'Locality deleted successfully']);
    }

    public function bulkDelete(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:localities,id'
        ]);

        Locality::whereIn('id', $request->ids)->delete();

        return response()->json(['message' => 'Localities deleted successfully']);
    }
}