<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotificationPreference extends Model
{
    use HasFactory;

    protected $table = 'user_notif_prefs';

    protected $fillable = [
        'user_id',
        'notification_type_id',
        'email_enabled',
        'browser_enabled',
    ];

    protected $casts = [
        'email_enabled' => 'boolean',
        'browser_enabled' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function notificationType(): BelongsTo
    {
        return $this->belongsTo(NotificationType::class);
    }

    public static function toggle(int $userId, int $notificationTypeId, string $channel = 'email'): bool
    {
        $pref = self::firstOrCreate([
            'user_id' => $userId,
            'notification_type_id' => $notificationTypeId,
        ], [
            'email_enabled' => false,
            'browser_enabled' => true,
        ]);

        $field = $channel.'_enabled';
        $pref->$field = ! $pref->$field;
        $pref->save();

        return $pref->$field;
    }
}
