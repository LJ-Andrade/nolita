<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'remember' => 'boolean|nullable',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Set token expiration based on remember me flag
        $remember = $request->boolean('remember', false);
        $expiration = $remember 
            ? Carbon::now()->addDays(30)  // 30 days for remember me
            : Carbon::now()->addHours(8); // 8 hours for normal session

        $token = $user->createToken('auth_token', ['*'], $expiration)->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_at' => $expiration->toDateTimeString(),
            'remember' => $remember,
            'user' => new UserResource($user->load(['roles.permissions', 'media'])),
        ]);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user()->load('roles');
        $pendingOrders = Order::query()
            ->with('customer:id,name,email')
            ->where('status', 'pending')
            ->latest()
            ->get();

        $unpaidOrders = Order::query()
            ->with('customer:id,name,email')
            ->where('payment_status', 'unpaid')
            ->latest()
            ->get();

        $mapDashboardOrder = static function (Order $order): array {
            $customerData = is_array($order->customer_data) ? $order->customer_data : [];
            $customerName = $order->customer?->name
                ?? ($customerData['name'] ?? null)
                ?? 'Invitado';
            $customerEmail = $order->customer?->email
                ?? ($customerData['email'] ?? null);

            return [
                'id' => $order->id,
                'customer_name' => $customerName,
                'customer_email' => $customerEmail,
                'total_amount' => $order->total_amount,
                'currency' => $order->currency,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'created_at' => optional($order->created_at)?->toISOString(),
            ];
        };
        
        return response()->json([
            'message' => 'Welcome to the dashboard!',
            'user' => $user,
            'stats' => [
                'pending_orders' => $pendingOrders->count(),
                'unpaid_orders' => $unpaidOrders->count(),
            ],
            'pending_orders' => $pendingOrders->map($mapDashboardOrder)->values(),
            'unpaid_orders' => $unpaidOrders->map($mapDashboardOrder)->values(),
        ]);
    }
}
