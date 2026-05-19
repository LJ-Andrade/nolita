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

    private const DEFAULT_PATHS_BY_TAG = [
        self::PRODUCTS => [
            '/',
            '/catalogo',
            '/catalog',
            '/buscar',
            '/search',
        ],
        self::COLLECTIONS => [
            '/',
            '/catalogo',
            '/catalog',
            '/buscar',
            '/search',
        ],
        self::SITE_CONTENT => [
            '/',
            '/vadmin-storage/web/hero_1.jpg',
            '/vadmin-storage/web/hero_1.jpeg',
            '/vadmin-storage/web/hero_1.png',
            '/vadmin-storage/web/hero_1.webp',
            '/vadmin-storage/web/hero_mobile_1.jpg',
            '/vadmin-storage/web/hero_mobile_1.jpeg',
            '/vadmin-storage/web/hero_mobile_1.png',
            '/vadmin-storage/web/hero_mobile_1.webp',
        ],
        self::SHOP_CONFIGURATION => [
            '/finalizar-compra',
            '/checkout',
        ],
        self::CHECKOUT_METHODS => [
            '/finalizar-compra',
            '/checkout',
        ],
    ];

    /**
     * Trigger Next.js cache revalidation without blocking admin writes.
     */
    public function revalidate(array $tags, array $paths = []): void
    {
        $tags = array_values(array_unique(array_filter($tags)));
        $paths = $this->resolvePaths($tags, $paths);

        $this->triggerNextRevalidation($tags, $paths);
        $this->purgeCloudflare($tags, $paths);
    }

    private function triggerNextRevalidation(array $tags, array $paths): void
    {
        $webhookUrl = config('app.revalidate_webhook_url');
        $token = config('app.revalidate_token');

        if (!$webhookUrl || !$token) {
            return;
        }

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

    private function purgeCloudflare(array $tags, array $paths): void
    {
        $zoneId = config('services.cloudflare.zone_id');
        $apiToken = config('services.cloudflare.api_token');
        $urls = $this->buildCloudflareUrls($paths);

        if (!$zoneId || !$apiToken || empty($urls)) {
            return;
        }

        try {
            foreach (array_chunk($urls, 30) as $chunk) {
                Http::timeout(5)
                    ->acceptJson()
                    ->withToken($apiToken)
                    ->post("https://api.cloudflare.com/client/v4/zones/{$zoneId}/purge_cache", [
                        'files' => $chunk,
                    ])
                    ->throw();
            }
        } catch (Throwable $e) {
            Log::warning('Failed to purge Cloudflare storefront cache.', [
                'message' => $e->getMessage(),
                'tags' => $tags,
                'paths' => $paths,
                'urls' => $urls,
            ]);
        }
    }

    private function resolvePaths(array $tags, array $paths): array
    {
        foreach ($tags as $tag) {
            $paths = [
                ...$paths,
                ...(self::DEFAULT_PATHS_BY_TAG[$tag] ?? []),
            ];
        }

        return array_values(array_unique(array_filter($paths)));
    }

    private function buildCloudflareUrls(array $paths): array
    {
        $baseUrl = rtrim((string) config('app.url'), '/');

        if (!str_starts_with($baseUrl, 'http://') && !str_starts_with($baseUrl, 'https://')) {
            return [];
        }

        return array_values(array_unique(array_map(
            fn (string $path): string => str_starts_with($path, 'http://') || str_starts_with($path, 'https://')
                ? $path
                : $baseUrl . '/' . ltrim($path, '/'),
            $paths,
        )));
    }
}
