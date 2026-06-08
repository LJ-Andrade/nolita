<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'price_mode_scope',
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

    public function scopeForPriceMode($query, ?string $priceMode)
    {
        $mode = $priceMode === 'wholesale' ? 'wholesale' : 'retail';

        return $query->whereIn('price_mode_scope', ['both', $mode]);
    }

    public function appliesToPriceMode(?string $priceMode): bool
    {
        $mode = $priceMode === 'wholesale' ? 'wholesale' : 'retail';
        $scope = $this->price_mode_scope ?: 'both';

        return $scope === 'both' || $scope === $mode;
    }

    public function isValidForCheckout(?string $priceMode = null): bool
    {
        return $this->active
            && (!$this->expires_at || $this->expires_at->isFuture())
            && $this->appliesToPriceMode($priceMode);
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
