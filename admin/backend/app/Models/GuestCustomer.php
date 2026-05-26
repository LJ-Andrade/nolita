<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class GuestCustomer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'whatsapp',
        'cuit',
        'address',
        'city',
        'postal_code',
        'province_id',
        'locality_id',
        'bought_wholesale',
        'bought_retail',
        'orders_count',
        'total_spent',
        'last_order_at',
    ];

    protected $casts = [
        'bought_wholesale' => 'boolean',
        'bought_retail' => 'boolean',
        'orders_count' => 'integer',
        'total_spent' => 'decimal:2',
        'last_order_at' => 'datetime',
    ];

    public function setEmailAttribute(?string $value): void
    {
        $this->attributes['email'] = $value === null ? null : strtolower(trim($value));
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function locality(): BelongsTo
    {
        return $this->belongsTo(Locality::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'guest_customer_id');
    }

    /**
     * Upsert a guest customer from an anonymous checkout payload.
     *
     * Never throws. Returns the persisted record or null when the email is missing
     * or any unexpected error happens (callers must not block the checkout flow).
     *
     * @param array<string, mixed> $customerData The order customer_data payload.
     * @param string $priceMode `retail` or `wholesale`.
     * @param float $totalAmount Order total to add to the lifetime spend.
     * @param \Illuminate\Support\Carbon|\DateTimeInterface|null $orderAt Order timestamp.
     */
    public static function upsertFromCheckout(
        array $customerData,
        string $priceMode,
        float $totalAmount,
        $orderAt = null
    ): ?self {
        $email = isset($customerData['email']) ? strtolower(trim((string) $customerData['email'])) : '';
        if ($email === '') {
            return null;
        }

        try {
            /** @var self $guest */
            $guest = self::firstOrNew(['email' => $email]);

            $fields = ['name', 'phone', 'whatsapp', 'cuit', 'address', 'city', 'postal_code', 'province_id', 'locality_id'];
            foreach ($fields as $field) {
                $incoming = $customerData[$field] ?? null;
                if ($incoming === null || $incoming === '') {
                    continue;
                }
                $guest->{$field} = $incoming;
            }

            if ($priceMode === 'wholesale') {
                $guest->bought_wholesale = true;
            } else {
                $guest->bought_retail = true;
            }

            $guest->orders_count = ((int) $guest->orders_count) + 1;
            $guest->total_spent = round(((float) $guest->total_spent) + $totalAmount, 2);
            $guest->last_order_at = $orderAt ? Carbon::parse($orderAt) : Carbon::now();
            $guest->save();

            return $guest;
        } catch (\Throwable $e) {
            report($e);
            return null;
        }
    }
}
