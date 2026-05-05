<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProvinceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'cost' => $this->cost,
            'localities_count' => $this->when($this->localities_count !== null, $this->localities_count),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}