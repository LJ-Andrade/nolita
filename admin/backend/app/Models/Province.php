<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Province extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'cost'];

    protected $casts = [
        'cost' => 'decimal:2',
    ];

    public function localities(): HasMany
    {
        return $this->hasMany(Locality::class);
    }
}