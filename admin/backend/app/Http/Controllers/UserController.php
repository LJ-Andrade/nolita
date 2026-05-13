<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function assignableRoles(Request $request): AnonymousResourceCollection
    {
        $roles = Role::query()
            ->when(! $this->actingUserIsSuperAdmin($request), function ($query) {
                $query->where('name', '!=', 'Super Admin');
            })
            ->orderBy('name')
            ->get();

        return RoleResource::collection($roles);
    }

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
        $filterEmail = $request->query('filter_email');
        $sortBy = $request->query('sort_by', 'id');
        $sortDir = $request->query('sort_dir', 'desc');

        $allowedSortBy = ['id', 'name', 'email', 'created_at'];
        $allowedSortDir = ['asc', 'desc'];

        if (!in_array($sortBy, $allowedSortBy)) {
            $sortBy = 'id';
        }

        if (!in_array($sortDir, $allowedSortDir)) {
            $sortDir = 'desc';
        }

        $users = User::query()
            ->when($filterId, function ($query, $filterId) {
                $query->where('id', $filterId);
            })
            ->when($filterName, function ($query, $filterName) {
                $query->where('name', 'like', "%{$filterName}%");
            })
            ->when($filterEmail, function ($query, $filterEmail) {
                $query->where('email', 'like', "%{$filterEmail}%");
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy($sortBy, $sortDir)
            ->with(['roles.permissions', 'media'])
            ->paginate(10);

        return UserResource::collection($users);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  Request  $request
     * @return UserResource
     */
    public function store(Request $request): UserResource
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_ids' => 'sometimes|array',
            'role_ids.*' => 'exists:roles,id',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $this->ensureCanAssignRoles($request, $validated['role_ids'] ?? []);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        if ($request->hasFile('avatar')) {
            $user->addMediaFromRequest('avatar')->toMediaCollection('avatar');
        }

        if ($request->has('role_ids')) {
            $user->roles()->sync($request->role_ids);
        }

        return new UserResource($user->load(['roles.permissions', 'media']));
    }

    /**
     * Display the specified resource.
     *
     * @param  User  $user
     * @return UserResource
     */
    public function show(User $user): UserResource
    {
        return new UserResource($user->load(['roles.permissions', 'media']));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  Request  $request
     * @param  User  $user
     * @return UserResource
     */
    public function update(Request $request, User $user): UserResource
    {
        $this->ensureCanModifyTarget($request, $user);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => [
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8',
            'role_ids' => 'sometimes|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        $roleIds = $validated['role_ids'] ?? null;
        unset($validated['role_ids']);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        if ($roleIds !== null) {
            $this->ensureCanAssignRoles($request, $roleIds);
            $user->roles()->sync($roleIds);
        }

        return new UserResource($user->load(['roles.permissions', 'media']));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Request  $request
     * @param  User  $user
     * @return Response
     */
    public function destroy(Request $request, User $user): Response
    {
        $this->ensureCanModifyTarget($request, $user);

        $user->delete();

        return response()->noContent();
    }

    /**
     * Upload an avatar for the user.
     *
     * @param  Request  $request
     * @param  User  $user
     * @return UserResource
     */
    public function uploadAvatar(Request $request, User $user): UserResource
    {
        $this->ensureCanModifyTarget($request, $user);

        $request->validate([
            'avatar' => 'required|image',
        ]);

        $user->addMediaFromRequest('avatar')->toMediaCollection('avatar');

        return new UserResource($user->load(['roles.permissions', 'media']));
    }

    /**
     * Bulk delete multiple users.
     *
     * @param  Request  $request
     * @return Response
     */
    public function bulkDelete(Request $request): Response
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:users,id',
        ]);

        $ids = $request->input('ids');

        if (! $this->actingUserIsSuperAdmin($request)) {
            abort_if(User::role('Super Admin')->whereIn('id', $ids)->exists(), 403);
        }

        User::whereIn('id', $ids)->delete();

        return response()->noContent();
    }

    private function actingUserIsSuperAdmin(Request $request): bool
    {
        return (bool) $request->user()?->hasRole('Super Admin');
    }

    private function ensureCanModifyTarget(Request $request, User $user): void
    {
        if ($this->actingUserIsSuperAdmin($request)) {
            return;
        }

        abort_if($user->hasRole('Super Admin'), 403);
    }

    private function ensureCanAssignRoles(Request $request, array $roleIds): void
    {
        if ($this->actingUserIsSuperAdmin($request) || empty($roleIds)) {
            return;
        }

        abort_if(
            Role::query()->whereIn('id', $roleIds)->where('name', 'Super Admin')->exists(),
            403
        );
    }
}
