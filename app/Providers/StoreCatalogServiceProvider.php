<?php
namespace App\Providers;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;

class StoreCatalogServiceProvider extends ServiceProvider
{
    
    public function boot(View $view)
    {
        View::composer(['store.index', 'store.category'], 'App\Http\ViewComposes\StoreCatalogComposer');
    }
    
    public function register()
    {
        //
    }

}
