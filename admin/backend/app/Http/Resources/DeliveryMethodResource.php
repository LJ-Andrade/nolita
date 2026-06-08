<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryMethodResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'fee' => $this->fee,
            'price_mode_scope' => $this->price_mode_scope ?: 'both',
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
