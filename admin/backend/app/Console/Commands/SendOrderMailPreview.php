<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\CustomerMailService;
use Illuminate\Console\Command;

final class SendOrderMailPreview extends Command
{
    protected $signature = 'mail:order-preview
        {email : Address that receives the preview}
        {--order= : Placed order id (defaults to the latest placed order)}';

    protected $description = 'Send the customer purchase email for an existing order to an address, without the queue';

    public function handle(CustomerMailService $mail): int
    {
        $email = (string) $this->argument('email');

        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            $this->error("Invalid email: {$email}");

            return self::FAILURE;
        }

        $order = $this->option('order')
            ? Order::query()->find($this->option('order'))
            : Order::query()->whereNotNull('customer_data')->latest('id')->first();

        if ($order === null || $order->customer_data === null) {
            $this->error('No placed order found. Pass --order with a checked-out order id.');

            return self::FAILURE;
        }

        $mail->sendOrderPurchasedPreview($order, $email);

        $this->info("Purchase email for order #{$order->id} sent to {$email}.");

        return self::SUCCESS;
    }
}
