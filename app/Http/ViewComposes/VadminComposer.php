<?php 

namespace App\Http\ViewComposes;

use Illuminate\Contracts\View\View;
use App\Cart;
use App\Traits\CartTrait;
use App\Contact;
use App\Customer;
use App\Settings;

class VadminComposer
{
    use CartTrait;

    public function compose(View $view)
    {
        $settings = Settings::find(1);
        
        $newMessages = Contact::where('status', '=', '0')->get();
        $newOrders = Cart::where('status', '=', 'Process')->count();
        $newResellers = Customer::where('status', '=', '0')->where('group', '=', '3')->count();
        $activeOrders = Cart::where('status', '=', 'Active')->count();
        $view->with('newMessages', $newMessages)
             ->with('newOrders', $newOrders)
             ->with('newResellers', $newResellers)
             ->with('activeOrders', $activeOrders)
             ->with('settings', $settings);
    }
}