<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
use App\Models\Order;
use App\Models\ProductCategory;
use App\Observers\OrderObserver;
use App\Observers\CategoryObserver;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Order::observe(OrderObserver::class);
        ProductCategory::observe(CategoryObserver::class);

        \Illuminate\Auth\Notifications\ResetPassword::createUrlUsing(function (User $user, string $token) {
            $baseUrl = env('APP_FRONTEND_URL', 'http://localhost:5173/vadmin');
            return $baseUrl . '/reset-password?token=' . $token . '&email=' . $user->email;
        });
    }
}