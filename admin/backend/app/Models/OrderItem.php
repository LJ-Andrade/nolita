<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $appends = [
        'product_code',
    ];

    protected $fillable = [
        'order_id',
        'product_id',
        'product_variant_id',
        'product_name', // denormalized for historical record
        'quantity',
        'unit_price',
        'subtotal',
        'metadata'
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getProductCodeAttribute(): ?string
    {
        $metadataCode = is_array($this->metadata) ? ($this->metadata['product_code'] ?? null) : null;
        $productCode = $this->relationLoaded('product') ? $this->product?->code : null;
        $variantProductCode = (
            $this->relationLoaded('variant')
            && $this->variant
            && $this->variant->relationLoaded('product')
        ) ? $this->variant->product?->code : null;

        return $metadataCode
            ?: $productCode
            ?: $variantProductCode;
    }
}
