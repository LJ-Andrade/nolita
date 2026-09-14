<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\NotificationType;
use App\Services\NotificationService;

class OrderObserver
{
    public function updated(Order $order): void
    {
        try {
            // The buyer email is sent at checkout (CustomerMailService); completion only notifies admins.
            if ($order->wasChanged('status') && $order->status === 'completed') {
                $this->notifyAdmins($order);
            }
        } catch (\Exception $e) {
            \Log::error('OrderObserver error: ' . $e->getMessage());
        }
    }

    protected function notifyAdmins(Order $order): void
    {
        $notificationType = NotificationType::where('key', 'order.created')->first();
        if (!$notificationType || !$notificationType->is_active) {
            return;
        }

        $customer = $order->customerSnapshot();

        $notificationService = app(NotificationService::class);
        $notificationService->sendToSubscribers(
            $notificationType,
            'Nuevo Pedido #' . $order->id,
            'Cliente: ' . ($customer['name'] ?? 'N/A') . ' - Total: ' . $order->currency . ' ' . number_format($order->total_amount, 2),
            [
                'order_id' => $order->id,
                'customer_name' => $customer['name'] ?? 'N/A',
                'customer_email' => $customer['email'] ?? 'N/A',
                'total' => $order->total_amount,
                'currency' => $order->currency,
            ]
        );
    }
}