<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class StorefrontRevalidationService
{
    public const PRODUCTS = 'products';
    public const COLLECTIONS = 'collections';
    public const SITE_CONTENT = 'site-content';
    public const SHOP_CONFIGURATION = 'shop-configuration';
    public const CHECKOUT_METHODS = 'checkout-methods';

    /**
     * Trigger Next.js cache revalidation without blocking admin writes.
     */
    public function revalidate(array $tags, array $paths = []): void
    {
        $webhookUrl = config('app.revalidate_webhook_url');
        $token = config('app.revalidate_token');

        if (!$webhookUrl || !$token) {
            return;
        }

        $tags = array_values(array_unique(array_filter($tags)));
        $paths = array_values(array_unique(array_filter($paths)));

        try {
            Http::timeout(5)
                ->acceptJson()
                ->withHeaders(['X-Revalidate-Token' => $token])
                ->post($webhookUrl, [
                    'tags' => $tags,
                    'paths' => $paths,
                ])
                ->throw();
        } catch (Throwable $e) {
            Log::warning('Failed to trigger storefront revalidation.', [
                'message' => $e->getMessage(),
                'tags' => $tags,
                'paths' => $paths,
            ]);
        }
    }
}
