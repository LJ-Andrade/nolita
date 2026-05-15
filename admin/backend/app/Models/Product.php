<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Product extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, LogsActivity;

    protected $fillable = [
        'name',
        'code',
        'slug',
        'description',
        'cost_price',
        'sale_price',
        'status',
        'featured',
        'hide_on_wholesale',
        'order',
        'qr_url',
        'user_id',
        'category_id',
        'wholesale_price',
        'discount',
        'stock',
        'min_stock',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'discount' => 'decimal:2',
        'order' => 'integer',
        'featured' => 'boolean',
        'hide_on_wholesale' => 'boolean',
        'stock' => 'integer',
        'min_stock' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->useLogName('product');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }


    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(ProductTag::class, 'product_product_tag', 'product_id', 'product_tag_id');
    }

    public function sizes(): BelongsToMany
    {
        return $this->belongsToMany(ProductSize::class, 'product_product_size', 'product_id', 'product_size_id');
    }

    public function colors(): BelongsToMany
    {
        return $this->belongsToMany(ProductColor::class, 'product_product_color', 'product_id', 'product_color_id');
    }

    public function favoritedBy(): BelongsToMany
    {
        return $this->belongsToMany(Customer::class, 'customer_favorites')
            ->withTimestamps();
    }

    public function variants(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($product) {
            if (empty($product->slug) && !empty($product->name)) {
                $product->slug = \Illuminate\Support\Str::slug($product->name);
            }
        });
        static::created(function ($product) {
            $product->qr_url = $product->generateQrUrl();
            $product->save();
        });
        static::saving(function ($product) {
            if ($product->slug) {
                $product->slug = \Illuminate\Support\Str::slug($product->slug);
            }
        });
    }

    public function generateQrUrl(): string
    {
        $siteUrl = SystemSetting::getSiteUrl();
        if (empty($siteUrl)) {
            return '';
        }
        return rtrim($siteUrl, '/') . '/producto/' . $this->id;
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cover')
            ->singleFile()
            ->useDisk('public')
            ->acceptsFile(function ($file) {
                return in_array($file->mimeType, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
            });
            
        $this->addMediaCollection('gallery')
            ->useDisk('public')
            ->acceptsFile(function ($file) {
                return in_array($file->mimeType, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
            });

        $this->addMediaCollection('color_images')
            ->useDisk('public')
            ->acceptsFile(function ($file) {
                return in_array($file->mimeType, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
            });

        $this->addMediaCollection('document')
            ->singleFile()
            ->useDisk('public')
            ->acceptsFile(function ($file) {
                return in_array($file->mimeType, ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
            });
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        //
    }
}
