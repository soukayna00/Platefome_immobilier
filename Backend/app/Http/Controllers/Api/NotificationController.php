<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $notifications = $request->user()
            ->notificationsAtba()
            ->orderByDesc('date_creation')
            ->orderByDesc('id')
            ->paginate(20);

        $unreadCount = $request->user()
            ->notificationsAtba()
            ->whereNull('date_lecture')
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markRead(Request $request, int $id)
    {
        $notification = $request->user()
            ->notificationsAtba()
            ->findOrFail($id);

        $request->user()
            ->notificationsAtba()
            ->whereKey($id)
            ->whereNull('date_lecture')
            ->update(['date_lecture' => now()]);

        return response()->json($notification->fresh());
    }
}
