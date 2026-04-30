<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
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
        
        return response()->json([
            'message' => 'Welcome to the dashboard!',
            'user' => $user,
            'stats' => [
                'total_users' => User::count(),
                'total_posts' => \App\Models\Post::count(),
            ]
        ]);
    }
}
