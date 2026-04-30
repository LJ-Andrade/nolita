<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $avatarPath = 'users/' . $this->id . '/avatar.jpg';
        $avatarUrl = Storage::disk('public')->exists($avatarPath) 
            ? asset('storage/' . $avatarPath) . '?v=' . ($this->updated_at ? $this->updated_at->timestamp : time())
            : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar_url' => $avatarUrl,
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            'primary_role' => $this->whenLoaded('roles', function () {
                $role = $this->roles->first();
                return $role ? [
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                ] : null;
            }),
            'permissions' => $this->whenLoaded('roles', function () {
                return $this->roles->flatMap(function ($role) {
                    return $role->permissions->pluck('name');
                })->unique()->values();
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
