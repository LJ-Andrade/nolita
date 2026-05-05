<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Locality extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'province_id', 'cost'];

    protected $casts = [
        'cost' => 'decimal:2',
    ];

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }
}