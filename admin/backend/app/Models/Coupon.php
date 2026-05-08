<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'discount_type',
        'amount',
        'expires_at',
        'active',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'active' => 'boolean',
        'amount' => 'decimal:2',
    ];

    public function isValidForCheckout(): bool
    {
        return $this->active && (!$this->expires_at || $this->expires_at->isFuture());
    }

    public function discountForSubtotal(float $subtotal): float
    {
        if ($subtotal <= 0) {
            return 0;
        }

        $amount = (float) $this->amount;
        $discount = $this->discount_type === 'percentage'
            ? $subtotal * min($amount, 100) / 100
            : $amount;

        return round(min(max($discount, 0), $subtotal), 2);
    }
}
