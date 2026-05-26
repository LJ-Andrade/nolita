<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuestCustomerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'cuit' => $this->cuit,
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'province_id' => $this->province_id,
            'locality_id' => $this->locality_id,
            'province' => $this->whenLoaded('province'),
            'locality' => $this->whenLoaded('locality'),
            'bought_wholesale' => (bool) $this->bought_wholesale,
            'bought_retail' => (bool) $this->bought_retail,
            'orders_count' => (int) $this->orders_count,
            'total_spent' => (float) $this->total_spent,
            'last_order_at' => $this->last_order_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
