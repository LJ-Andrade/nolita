<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Permission\Models\Role;

class NotificationType extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'description',
        'required_permission',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function preferences(): HasMany
    {
        return $this->hasMany(UserNotificationPreference::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'notification_type_role');
    }

    public function usersWithPermission()
    {
        return User::role($this->roles()->pluck('name')->all());
    }
}
