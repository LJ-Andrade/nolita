<?php

namespace App\Http\Controllers;

use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param  Request  $request
     * @return AnonymousResourceCollection
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

        $rolesQuery = Role::query()
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
            $roles = $rolesQuery->get();
        } else {
            $roles = $rolesQuery->paginate(10);
        }

        return RoleResource::collection($roles);
    }

    /**
     * Display the specified resource.
     *
     * @param  Role  $role
     * @return RoleResource
     */
    public function show(Role $role): RoleResource
    {
        return new RoleResource($role->load('permissions'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  Request  $request
     * @return RoleResource
     */
    public function store(Request $request): RoleResource
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'display_name' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'] ?? null,
        ]);

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        return new RoleResource($role);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  Request  $request
     * @param  Role  $role
     * @return RoleResource
     */
    public function update(Request $request, Role $role): RoleResource
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles')->ignore($role->id),
            ],
            'display_name' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->update([
            'name' => $validated['name'],
            'display_name' => $validated['display_name'] ?? null,
        ]);

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        return new RoleResource($role);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Role  $role
     * @return Response
     */
    public function destroy(Role $role): Response
    {
        $role->delete();

        return response()->noContent();
    }

    /**
     * Bulk delete multiple roles.
     *
     * @param  Request  $request
     * @return Response
     */
    public function bulkDelete(Request $request): Response
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:roles,id',
        ]);

        $ids = $request->input('ids');
        Role::whereIn('id', $ids)->delete();

        return response()->noContent();
    }
}
