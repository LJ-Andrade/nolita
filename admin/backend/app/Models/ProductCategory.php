<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductCategory extends Model
{
    protected $fillable = ['name', 'slug', 'image', 'listed', 'order'];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'category_id');
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($category) {
            if (empty($category->slug) && !empty($category->name)) {
                $category->slug = \Illuminate\Support\Str::slug($category->name);
            }
        });
        static::saving(function ($category) {
            if ($category->slug) {
                $category->slug = \Illuminate\Support\Str::slug($category->slug);
            }
        });
    }
}
