<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerFavoritesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $customer = $request->user();
        $favorites = $customer->favorites()
            ->with(['category', 'tags', 'variants.color', 'variants.size', 'colors', 'media'])
            ->get();

        $transformed = $favorites->map(fn (Product $product) => $this->transformProduct($product));

        return response()->json(['data' => $transformed]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
        ]);

        $customer = $request->user();
        $customer->favorites()->syncWithoutDetaching([$validated['product_id']]);

        return response()->json(['message' => 'Added to favorites'], 201);
    }

    public function destroy(Request $request, int $productId): JsonResponse
    {
        $customer = $request->user();
        $customer->favorites()->detach($productId);

        return response()->json(['message' => 'Removed from favorites']);
    }

    private function transformProduct(Product $product): array
    {
        $colorImages = $product->getMedia('color_images')->map(function ($media) use ($product) {
            $color = $product->colors->firstWhere('id', $media->getCustomProperty('color_id'));
            if (!$color) return null;
            return [
                'color' => $color->name,
                'url' => $media->getFullUrl(),
            ];
        })->filter()->values()->toArray();

        $coverMedia = $product->getFirstMedia('cover');
        $gallery = $product->getMedia('gallery');

        $colors = $product->variants->pluck('color')->filter()->unique('id');
        $sizes = $product->variants->pluck('size')->filter()->unique('id');

        return [
            'id' => (string) $product->id,
            'handle' => $product->slug,
            'availableForSale' => true,
            'title' => $product->name,
            'description' => $product->description,
            'descriptionHtml' => $product->description,
            'options' => array_values(array_filter([
                $colors->isNotEmpty() ? [
                    'id' => 'color',
                    'name' => 'Color',
                    'values' => $colors->pluck('name')->toArray(),
                ] : null,
                $sizes->isNotEmpty() ? [
                    'id' => 'size',
                    'name' => 'Talle',
                    'values' => $sizes->pluck('name')->toArray(),
                ] : null,
            ])),
            'priceRange' => [
                'maxVariantPrice' => [
                    'amount' => (string) $product->sale_price,
                    'currencyCode' => '$',
                ],
                'minVariantPrice' => [
                    'amount' => (string) $product->sale_price,
                    'currencyCode' => '$',
                ],
            ],
            'variants' => $product->variants->map(function ($variant) use ($product) {
                $variantOptions = [];
                if ($variant->color) {
                    $variantOptions[] = ['name' => 'Color', 'value' => $variant->color->name];
                }
                if ($variant->size) {
                    $variantOptions[] = ['name' => 'Talle', 'value' => $variant->size->name];
                }
                return [
                    'id' => (string) $variant->id,
                    'title' => $variant->sku ?? $variant->product->name,
                    'availableForSale' => $variant->stock > 0 && $variant->active,
                    'quantityAvailable' => (int) ($variant->stock ?? 0),
                    'selectedOptions' => $variantOptions,
                    'price' => [
                        'amount' => (string) ($variant->price ?? $variant->product->sale_price),
                        'currencyCode' => '$',
                    ],
                ];
            }),
            'images' => $gallery->map(fn ($m) => [
                'url' => $m->getFullUrl(),
                'altText' => $product->name,
                'width' => $m->getCustomProperty('width') ?? 800,
                'height' => $m->getCustomProperty('height') ?? 800,
            ])->values()->toArray(),
            'featuredImage' => $coverMedia ? [
                'url' => $coverMedia->getFullUrl(),
                'altText' => $product->name,
                'width' => $coverMedia->getCustomProperty('width') ?? 800,
                'height' => $coverMedia->getCustomProperty('height') ?? 800,
            ] : null,
            'seo' => [
                'title' => $product->name,
                'description' => $product->description,
            ],
            'tags' => $product->tags->pluck('name')->toArray(),
            'updatedAt' => $product->updated_at->toISOString(),
            'colorImages' => $colorImages,
        ];
    }
}
