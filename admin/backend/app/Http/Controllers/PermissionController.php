<?php

namespace App\Http\Controllers;

use App\Http\Resources\PermissionResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $search = $request->query('search');
        $filterId = $request->query('filter_id');
        $filterName = $request->query('filter_name');
        $sortBy = $request->query('sort_by', 'id');
        $sortDir = $request->query('sort_dir', 'desc');

        $allowedSortBy = ['id', 'name', 'created_at'];
        $allowedSortDir = ['asc', 'desc'];

        if (!in_array($sortBy, $allowedSortBy)) {
            $sortBy = 'id';
        }

        if (!in_array($sortDir, $allowedSortDir)) {
            $sortDir = 'desc';
        }

        $permissionsQuery = Permission::query()
            ->when($filterId, function ($query, $filterId) {
                $query->where('id', $filterId);
            })
            ->when($filterName, function ($query, $filterName) {
                $query->where('name', 'like', "%{$filterName}%");
            })
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($sortBy, $sortDir);

        if ($request->query('all') == 1) {
            $permissions = $permissionsQuery->get();
        } else {
            $permissions = $permissionsQuery->paginate(10);
        }

        return PermissionResource::collection($permissions);
    }

    /**
     * Display the specified resource.
     */
    public function show(Permission $permission): PermissionResource
    {
        return new PermissionResource($permission);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): PermissionResource
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name',
        ]);

        $permission = Permission::create($validated);

        return new PermissionResource($permission);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Permission $permission): PermissionResource
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('permissions')->ignore($permission->id),
            ],
        ]);

        $permission->update($validated);

        return new PermissionResource($permission);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Permission $permission): Response
    {
        $permission->delete();

        return response()->noContent();
    }
}
