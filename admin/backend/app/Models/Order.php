<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'customer_id',
        'guest_customer_id',
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
        'notes',
        'stock_deducted_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'coupon_discount_amount' => 'decimal:2',
        'customer_data' => 'array',
        'shipping_address' => 'array',
        'billing_address' => 'array',
        'stock_deducted_at' => 'datetime',
    ];

    /**
     * Customer server cart: a pending order that was never checked out.
     */
    public function scopeActiveCart(Builder $query): Builder
    {
        return $query
            ->where('status', self::STATUS_PENDING)
            ->whereNull('customer_data');
    }

    /**
     * Customer data frozen when the order was placed (`customer_data`, then `shipping_address`).
     * Never reads the live customer record.
     */
    public function customerSnapshot(): array
    {
        $shipping = is_array($this->shipping_address) ? $this->shipping_address : [];
        $customerData = is_array($this->customer_data) ? $this->customer_data : [];

        return array_filter(
            array_merge($shipping, $customerData),
            fn (mixed $value): bool => $value !== null && $value !== '',
        );
    }

    public function hasDeductedStock(): bool
    {
        return $this->stock_deducted_at !== null;
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function guestCustomer(): BelongsTo
    {
        return $this->belongsTo(GuestCustomer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
