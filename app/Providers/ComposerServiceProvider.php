<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;


class ComposerServiceProvider extends ServiceProvider
{
 
    public function boot()
    {
        View::composer(['web.portfolio.portfolio'], 'App\Http\ViewComposes\ShowTagsCategories');
    }
 
    public function register()
    {
        //
    }
}

