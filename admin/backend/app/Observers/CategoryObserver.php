<?php

namespace App\Observers;

use App\Models\ProductCategory;
use App\Models\NotificationType;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

class CategoryObserver
{
    public function created(ProductCategory $category): void
    {
        try {
            $notificationType = NotificationType::where('key', 'category.created')->first();
            if (!$notificationType || !$notificationType->is_active) {
                return;
            }

            $notificationService = app(NotificationService::class);
            $notificationService->sendToSubscribers(
                $notificationType,
                'Categoría Creada',
                'Se creó la categoría: ' . $category->name,
                [
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                    'parent_id' => $category->parent_id,
                ]
            );
        } catch (\Exception $e) {
            \Log::error('CategoryObserver error: ' . $e->getMessage());
        }
    }
}