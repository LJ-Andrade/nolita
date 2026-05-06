<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShopConfiguration extends Model
{
    protected $fillable = ['min_quantity', 'min_amount'];

    protected $casts = [
        'min_quantity' => 'integer',
        'min_amount' => 'decimal:2',
    ];

    public static function getConfig(): self
    {
        return static::firstOrCreate([], [
            'min_quantity' => 0,
            'min_amount' => 0.00,
        ]);
    }
}
