<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationType;
use App\Models\UserNotificationPreference;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $notificationTypes = NotificationType::with('roles')
            ->where('is_active', true)
            ->get();

        $preferences = $user->notificationPreferences()->pluck('email_enabled', 'notification_type_id')->toArray();
        $preferencesBrowser = $user->notificationPreferences()->pluck('browser_enabled', 'notification_type_id')->toArray();

        $availableTypes = $notificationTypes->filter(function ($type) use ($user) {
            return $user->canReceiveNotification($type);
        });

        return response()->json([
            'notification_types' => $availableTypes->map(function ($type) use ($preferences, $preferencesBrowser) {
                return [
                    'id' => $type->id,
                    'key' => $type->key,
                    'name' => $type->name,
                    'description' => $type->description,
                    'email_enabled' => $preferences[$type->id] ?? false,
                    'browser_enabled' => $preferencesBrowser[$type->id] ?? true,
                ];
            }),
        ]);
    }

    public function toggle(Request $request, int $notificationTypeId)
    {
        $request->validate([
            'channel' => 'required|in:email,browser',
        ]);

        $notificationType = NotificationType::findOrFail($notificationTypeId);

        $user = $request->user();
        if (! $user->canReceiveNotification($notificationType)) {
            return response()->json(['error' => 'No tienes permiso para esta notificación'], 403);
        }

        $pref = UserNotificationPreference::firstOrCreate([
            'user_id' => $user->id,
            'notification_type_id' => $notificationTypeId,
        ], [
            'email_enabled' => false,
            'browser_enabled' => true,
        ]);

        $field = $request->channel.'_enabled';
        $pref->$field = ! $pref->$field;
        $pref->save();

        return response()->json([
            'notification_type_id' => $notificationTypeId,
            'channel' => $request->channel,
            'enabled' => $pref->$field,
        ]);
    }

    public function updatePreferences(Request $request)
    {
        $request->validate([
            'preferences' => 'required|array',
            'preferences.*.notification_type_id' => 'required|integer|exists:notification_types,id',
            'preferences.*.email_enabled' => 'required|boolean',
            'preferences.*.browser_enabled' => 'required|boolean',
        ]);

        $user = $request->user();

        foreach ($request->preferences as $prefData) {
            $notificationType = NotificationType::find($prefData['notification_type_id']);
            if (! $notificationType || ! $user->canReceiveNotification($notificationType)) {
                continue;
            }

            UserNotificationPreference::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'notification_type_id' => $prefData['notification_type_id'],
                ],
                [
                    'email_enabled' => $prefData['email_enabled'],
                    'browser_enabled' => $prefData['browser_enabled'],
                ]
            );
        }

        return response()->json(['message' => 'Preferencias actualizadas']);
    }
}
