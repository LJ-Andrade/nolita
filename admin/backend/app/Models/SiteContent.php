<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    public const BUSINESS_SECTION = 'business';

    public const BUSINESS_KEYS = [
        'business_phone',
        'business_email',
        'business_address',
        'business_hours',
        'business_whatsapp',
        'business_facebook',
        'business_instagram',
        'business_linkedin',
        'business_youtube',
        'business_tiktok',
    ];

    protected $fillable = [
        'section',
        'key',
        'value',
        'type',
        'description'
    ];

    /**
     * Get content value by key.
     */
    public static function getValue(string $key, $default = null): ?string
    {
        $content = static::where('key', $key)->first();
        return $content ? $content->value : $default;
    }

    /**
     * Update or create a content record.
     */
    public static function setContent(string $key, ?string $value, string $section = 'home', string $type = 'text', ?string $description = null): self
    {
        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'section' => $section,
                'type' => $type,
                'description' => $description
            ]
        );
    }

    public static function getBusinessInfo(): array
    {
        return static::query()
            ->where('section', self::BUSINESS_SECTION)
            ->whereIn('key', self::BUSINESS_KEYS)
            ->pluck('value', 'key')
            ->toArray();
    }
}
