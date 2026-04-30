<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $notifications = $user->notifications()->orderBy('created_at', 'desc')->limit(50)->get();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotificationsCount(),
        ]);
    }

    public function unreadCount(Request $request)
    {
        return response()->json([
            'unread_count' => $request->user()->unreadNotificationsCount(),
        ]);
    }

    public function markAsRead(Request $request, int $notificationId)
    {
        $notification = Notification::where('id', $notificationId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json(['message' => 'Notificación marcada como leída']);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->notifications()->unread()->update(['read_at' => now()]);

        return response()->json(['message' => 'Todas las notificaciones marcadas como leídas']);
    }

    public function destroy(Request $request, int $notificationId)
    {
        $notification = Notification::where('id', $notificationId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $notification->delete();

        return response()->json(['message' => 'Notificación eliminada']);
    }

    public function destroyAll(Request $request)
    {
        $request->user()->notifications()->delete();

        return response()->json(['message' => 'Todas las notificaciones eliminadas']);
    }
}