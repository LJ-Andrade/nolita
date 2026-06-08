<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class DeliveryMethod extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'name',
        'description',
        'fee',
        'price_mode_scope',
    ];

    protected $casts = [
        'fee' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->useLogName('delivery_method');
    }

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
}
