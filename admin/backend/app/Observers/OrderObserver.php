<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\NotificationType;
use App\Mail\OrderConfirmation;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class OrderObserver
{
    public function updated(Order $order): void
    {
        try {
            if ($order->wasChanged('status') && $order->status === 'completed') {
                $this->sendConfirmationEmail($order);
                $this->notifyAdmins($order);
            }
        } catch (\Exception $e) {
            \Log::error('OrderObserver error: ' . $e->getMessage());
        }
    }

    protected function sendConfirmationEmail(Order $order): void
    {
        if (!$order->customer || !$order->customer->email) {
            return;
        }

        Mail::to($order->customer->email)->queue(new OrderConfirmation($order));
    }

    protected function notifyAdmins(Order $order): void
    {
        $notificationType = NotificationType::where('key', 'order.created')->first();
        if (!$notificationType || !$notificationType->is_active) {
            return;
        }

        $notificationService = app(NotificationService::class);
        $notificationService->sendToSubscribers(
            $notificationType,
            'Nuevo Pedido #' . $order->id,
            'Cliente: ' . ($order->customer->name ?? 'N/A') . ' - Total: ' . $order->currency . ' ' . number_format($order->total_amount, 2),
            [
                'order_id' => $order->id,
                'customer_name' => $order->customer->name ?? 'N/A',
                'customer_email' => $order->customer->email ?? 'N/A',
                'total' => $order->total_amount,
                'currency' => $order->currency,
            ]
        );
    }
}