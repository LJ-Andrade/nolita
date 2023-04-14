<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;
use App\Cart;
use App\Traits\CartTrait;
use App\VLog;
use Log;

class DeleteInactiveCarts extends Command
{
    use CartTrait;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'delete:inactiveCarts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deleting inactive carts';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $maxTime = 24;
        $time = Carbon::now()->subHour($maxTime);
        $oldCarts = Cart::where('status','ACTIVE')->where('created_at', '<=', $time)->get();
     	//dd($oldCarts);   
        Log::info("-----------------------------------");
        Log::info("Eliminando carros de compra con más de " . $maxTime . "hs");
        Log::info("Fecha límite: " . $time);
        Log::info("-----------------------------------");
        
        $ids = [];
        
        foreach($oldCarts as $oldCart)
        {
            $details = 'Cart Id: '. $oldCart->id .  ' | Customer: '.  $oldCart->customer->name . ' ' . $oldCart->customer->surname . ' - ' . $oldCart->customer->username . ' | '. $oldCart->customer->email;
            
            array_push($ids, $oldCart->id);
            try {
                VLog::saveLog('Eliminando carro activo con más de ' . $maxTime . ' de hs.', $details, $oldCart->created_at->format('d/m/Y'));
            } catch (\Exception $e) {
                dd($e->getMessage());
            }
        }
	$this->manageOldCarts($ids, 'delete');
    }
}
