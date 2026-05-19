<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'status',
        'payment_status',
        'total_amount',
        'currency',
        'price_mode',
        'payment_method',
        'coupon_code',
        'coupon_discount_amount',
        'customer_data',
        'shipping_address',
        'billing_address',
        'notes'
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'coupon_discount_amount' => 'decimal:2',
        'customer_data' => 'array',
        'shipping_address' => 'array',
        'billing_address' => 'array',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
