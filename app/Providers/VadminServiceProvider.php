<?php
namespace App\Providers;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;

class VadminServiceProvider extends ServiceProvider
{
    
    public function boot(View $view)
    {
        View::composer(['vadmin.partials.main', 'vadmin.index', 'vadmin.tools.settings'], 'App\Http\ViewComposes\VadminComposer');
    }
    
    public function register()
    {
        //
    }
}


        