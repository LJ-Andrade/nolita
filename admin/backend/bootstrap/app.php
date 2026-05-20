<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Sentry\Laravel\Integration;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(append: [
            \App\Http\Middleware\SetLocale::class,
        ]);
        $middleware->alias([
            'permission' => \App\Http\Middleware\CheckPermission::class,
            'super_admin' => \App\Http\Middleware\EnsureSuperAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        Integration::handles($exceptions);

        $exceptions->render(function (\Illuminate\Database\QueryException $e, $request) {

            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Error de conexión con el servidor de base de datos.',
                ], 500);
            }
        });
        
        $exceptions->render(function (\PDOException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'No se pudo establecer la conexión con la base de datos.',
                ], 500);
            }
        });
    })->create();
