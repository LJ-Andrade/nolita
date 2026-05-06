<?php

namespace App\Services;

use App\Mail\AdminNotification;
use App\Models\Notification;
use App\Models\NotificationType;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public function sendToSubscribers(NotificationType $type, string $title, ?string $message = null, ?array $data = null): void
    {
        $type->loadMissing('roles');

        $users = User::with('roles')->get()
            ->filter(fn (User $user): bool => $user->canReceiveNotification($type));

        foreach ($users as $user) {
            $this->notifyUser($user, $type, $title, $message, $data);
        }
    }

    public function notifyUser(User $user, NotificationType $type, string $title, ?string $message = null, ?array $data = null): void
    {
        if ($user->isSubscribedTo($type, 'email')) {
            $this->sendEmailNotification($user, $type, $title, $message, $data);
        }

        $this->createBrowserNotification($user, $type, $title, $message, $data);
    }

    protected function sendEmailNotification(User $user, NotificationType $type, string $title, ?string $message, ?array $data): void
    {
        if (! $user->email) {
            return;
        }

        Mail::to($user->email)->queue(new AdminNotification([
            'type' => $type->key,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'user_name' => $user->name,
        ]));
    }

    protected function createBrowserNotification(User $user, NotificationType $type, string $title, ?string $message, ?array $data): void
    {
        Notification::createForUser($user->id, $type->key, $title, $message, $data);
    }
}
