<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    /**
     * Snapshot attributes read only from `metadata`, so placed orders never depend on live catalog data.
     */
    protected $appends = [
        'product_code',
        'sku',
        'color_name',
        'size_name',
        'variant_label',
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

    /**
     * Frozen variant data stored in `metadata` when an order is placed.
     * Expects the variant with `product`, `color`, and `size` loaded.
     *
     * @return array{product_code: ?string, sku: ?string, color: ?string, size: ?string}
     */
    public static function snapshotFromVariant(ProductVariant $variant): array
    {
        return [
            'product_code' => self::filledString($variant->product?->code),
            'sku' => self::filledString($variant->sku),
            'color' => self::filledString($variant->color?->name),
            'size' => self::filledString($variant->size?->name),
        ];
    }

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
        return $this->snapshotValue('product_code') ?: self::codeFromSku($this->snapshotValue('sku'));
    }

    public function getSkuAttribute(): ?string
    {
        return $this->snapshotValue('sku');
    }

    public function getColorNameAttribute(): ?string
    {
        return $this->snapshotValue('color');
    }

    public function getSizeNameAttribute(): ?string
    {
        return $this->snapshotValue('size');
    }

    public function getVariantLabelAttribute(): ?string
    {
        $label = collect([$this->color_name, $this->size_name])->filter()->implode(' / ');

        return $label !== '' ? $label : null;
    }

    private function snapshotValue(string $key): ?string
    {
        $metadata = is_array($this->metadata) ? $this->metadata : [];

        return self::filledString($metadata[$key] ?? null);
    }

    private static function codeFromSku(mixed $sku): ?string
    {
        $value = self::filledString($sku);
        if ($value === null) {
            return null;
        }

        $prefix = self::filledString(explode('-', $value)[0] ?? null);
        if ($prefix === null || strtoupper($prefix) === 'SKU') {
            return null;
        }

        return $prefix;
    }

    private static function filledString(mixed $value): ?string
    {
        $string = trim((string) $value);

        return $string !== '' ? $string : null;
    }
}
