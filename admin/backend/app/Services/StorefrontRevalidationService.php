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
    private const EXTERNAL_REQUEST_TIMEOUT = 2;
    private const EXTERNAL_CONNECT_TIMEOUT = 1;

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

        $revalidate = function () use ($tags, $paths): void {
            $this->triggerNextRevalidation($tags, $paths);
            $this->purgeCloudflare($tags, $paths);
        };

        if (app()->runningInConsole()) {
            $revalidate();

            return;
        }

        app()->terminating($revalidate);
    }

    private function triggerNextRevalidation(array $tags, array $paths): void
    {
        $webhookUrl = config('app.revalidate_webhook_url');
        $token = config('app.revalidate_token');

        if (!$webhookUrl || !$token) {
            return;
        }

        try {
            Http::connectTimeout(self::EXTERNAL_CONNECT_TIMEOUT)
                ->timeout(self::EXTERNAL_REQUEST_TIMEOUT)
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

        if (!$zoneId || !$apiToken) {
            Log::warning('Skipped Cloudflare storefront cache purge because credentials are not configured.', [
                'has_zone_id' => (bool) $zoneId,
                'has_api_token' => (bool) $apiToken,
                'tags' => $tags,
                'paths' => $paths,
            ]);

            return;
        }

        $purgeEverything = (bool) config('services.cloudflare.purge_everything');

        if (!$purgeEverything && empty($urls)) {
            Log::warning('Skipped Cloudflare storefront cache purge because no public storefront URLs could be built.', [
                'storefront_url' => config('services.cloudflare.storefront_url'),
                'tags' => $tags,
                'paths' => $paths,
            ]);

            return;
        }

        try {
            if ($purgeEverything) {
                Http::connectTimeout(self::EXTERNAL_CONNECT_TIMEOUT)
                    ->timeout(self::EXTERNAL_REQUEST_TIMEOUT)
                    ->acceptJson()
                    ->withToken($apiToken)
                    ->post("https://api.cloudflare.com/client/v4/zones/{$zoneId}/purge_cache", [
                        'purge_everything' => true,
                    ])
                    ->throw();

                return;
            }

            foreach (array_chunk($urls, 30) as $chunk) {
                Http::connectTimeout(self::EXTERNAL_CONNECT_TIMEOUT)
                    ->timeout(self::EXTERNAL_REQUEST_TIMEOUT)
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
                'purge_everything' => $purgeEverything,
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
        $baseUrl = rtrim((string) config('services.cloudflare.storefront_url'), '/');

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
