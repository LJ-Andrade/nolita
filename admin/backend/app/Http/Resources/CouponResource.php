<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CouponResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'price_mode_scope' => $this->price_mode_scope ?: 'both',
            'discount_type' => $this->discount_type,
            'amount' => $this->amount,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'active' => $this->active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
