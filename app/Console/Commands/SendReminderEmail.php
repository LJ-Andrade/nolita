<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;
use App\Mail\SendMail;
use App\Cart;
use Log;

class SendReminderEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'send:reminder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sending Reminder';

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
        $carts = Cart::where('status','ACTIVE')->where('created_at', '<=', $time)->get();
        
        $emails = [];
        foreach($carts as $cart)
        {
            array_push($emails, $cart->customer->email);
        }

        Log::info("-----------------------------------");
        Log::info("Sending Active cart Reminders");
        Log::info("Customers:");
        foreach($emails as $email)
        {
            Log::info($email);
        }
        Log::info("-----------------------------------");

        \Mail::to($emails)->send(new SendMail('Recordatorio', 'Reminder', ''));
    }
}
