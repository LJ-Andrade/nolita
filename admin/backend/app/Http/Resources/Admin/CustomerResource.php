<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'dni' => $this->dni,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'postal_code' => $this->postal_code,
            'is_active' => $this->is_active,
            'province_id' => $this->province_id,
            'locality_id' => $this->locality_id,
            'province' => $this->whenLoaded('province'),
            'locality' => $this->whenLoaded('locality'),
            'avatar_url' => $this->getFirstMediaUrl('avatar'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
