<?php

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements HasMedia
{
    use HasApiTokens, HasFactory, HasRoles, InteractsWithMedia, LogsActivity, Notifiable;

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

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function notificationPreferences(): HasMany
    {
        return $this->hasMany(UserNotificationPreference::class);
    }

    public function isSubscribedTo(NotificationType $notificationType, string $channel = 'email'): bool
    {
        $pref = $this->notificationPreferences()->where('notification_type_id', $notificationType->id)->first();
        if (! $pref) {
            return $channel === 'browser';
        }

        return (bool) $pref->{$channel.'_enabled'};
    }

    public function canReceiveNotification(NotificationType $notificationType): bool
    {
        if ($notificationType->required_permission && ! $this->can($notificationType->required_permission)) {
            return false;
        }

        $roles = $notificationType->relationLoaded('roles')
            ? $notificationType->roles
            : $notificationType->roles()->get();

        $roleNames = $roles->pluck('name')->all();

        if (empty($roleNames)) {
            return true;
        }

        return $this->hasAnyRole($roleNames);
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
