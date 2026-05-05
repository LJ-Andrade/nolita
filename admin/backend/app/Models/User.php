<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Permission\Traits\HasRoles;
use App\Notifications\ResetPasswordNotification;

class User extends Authenticatable implements HasMedia
{
    use HasApiTokens, HasFactory, Notifiable, InteractsWithMedia, LogsActivity, HasRoles;

    protected $guard_name = 'web';

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->logExcept(['password'])
            ->useLogName('user');
    }

    public function notifications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\Notification::class);
    }

    public function notificationPreferences(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UserNotificationPreference::class);
    }

    public function isSubscribedTo(\App\Models\NotificationType $notificationType, string $channel = 'email'): bool
    {
        $pref = $this->notificationPreferences()->where('notification_type_id', $notificationType->id)->first();
        if (!$pref) {
            return $channel === 'browser';
        }
        return (bool) $pref->{$channel . '_enabled'};
    }

    public function unreadNotificationsCount(): int
    {
        return $this->notifications()->unread()->count();
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile();
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
