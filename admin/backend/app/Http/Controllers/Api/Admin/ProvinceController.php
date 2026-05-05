<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProvinceRequest;
use App\Http\Resources\Admin\ProvinceResource;
use App\Models\Province;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProvinceController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Province::query()->withCount('localities');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $sortField = $request->input('sortField', 'name');
        $sortOrder = $request->input('sortOrder', 'asc');
        $query->orderBy($sortField, $sortOrder);

        $perPage = $request->input('perPage', 15);
        
        return ProvinceResource::collection($query->paginate($perPage));
    }

    public function store(ProvinceRequest $request): ProvinceResource
    {
        $province = Province::create($request->validated());
        $province->loadCount('localities');
        return new ProvinceResource($province);
    }

    public function show(Province $province): ProvinceResource
    {
        $province->loadCount('localities');
        return new ProvinceResource($province);
    }

    public function update(ProvinceRequest $request, Province $province): ProvinceResource
    {
        $province->update($request->validated());
        $province->loadCount('localities');
        return new ProvinceResource($province);
    }

    public function destroy(Province $province): \Illuminate\Http\JsonResponse
    {
        if ($province->localities()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar una provincia con localidades asociadas.'
            ], 422);
        }
        
        $province->delete();
        return response()->json(['message' => 'Province deleted successfully']);
    }

    public function bulkDelete(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:provinces,id'
        ]);

        $provincesWithLocalities = Province::whereIn('id', $request->ids)
            ->withCount('localities')
            ->having('localities_count', '>', 0)
            ->pluck('name')
            ->toArray();

        if (count($provincesWithLocalities) > 0) {
            return response()->json([
                'message' => 'Las siguientes provincias tienen localidades asociadas y no pueden eliminarse: ' . implode(', ', $provincesWithLocalities)
            ], 422);
        }

        Province::whereIn('id', $request->ids)->delete();

        return response()->json(['message' => 'Provinces deleted successfully']);
    }
}