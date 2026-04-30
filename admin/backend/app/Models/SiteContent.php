<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
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
}
