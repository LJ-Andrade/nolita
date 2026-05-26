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
        $originalPrice = $this->getOriginalPrice($product);
        $finalPrice = $this->getFinalPrice($product);
        $discount = $this->getDiscountPercent($product);
        $hasDiscount = $discount > 0 && $finalPrice < $originalPrice;
        $compareAtPrice = $hasDiscount ? [
            'amount' => (string) $originalPrice,
            'currencyCode' => '$',
        ] : null;
        $finalPricePayload = [
            'amount' => (string) $finalPrice,
            'currencyCode' => '$',
        ];
        $colorImages = $product->getMedia('color_images')->map(function ($media) use ($product) {
            $color = $product->colors->firstWhere('id', $media->getCustomProperty('color_id'));
            if (!$color) return null;
            return [
                'color' => $color->name,
                'url' => $media->getFullUrl(),
            ];
        })->filter()->values()->toArray();

        $gallery = $product->getMedia('gallery')->sortBy('order_column')->values();
        $featuredImage = $gallery->first() ?? $product->getFirstMedia('cover');

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
                'maxVariantPrice' => $finalPricePayload,
                'minVariantPrice' => $finalPricePayload,
            ],
            'compareAtPriceRange' => $hasDiscount ? [
                'maxVariantPrice' => $compareAtPrice,
                'minVariantPrice' => $compareAtPrice,
            ] : null,
            'discount' => $discount,
            'hasDiscount' => $hasDiscount,
            'variants' => $product->variants->map(function ($variant) use ($product, $finalPricePayload, $compareAtPrice, $discount, $hasDiscount) {
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
                    'price' => $finalPricePayload,
                    'compareAtPrice' => $compareAtPrice,
                    'discount' => $discount,
                    'hasDiscount' => $hasDiscount,
                ];
            }),
            'images' => $gallery->map(fn ($m) => [
                'url' => $m->getFullUrl(),
                'altText' => $product->name,
                'width' => $m->getCustomProperty('width') ?? 800,
                'height' => $m->getCustomProperty('height') ?? 800,
            ])->values()->toArray(),
            'featuredImage' => $featuredImage ? [
                'url' => $featuredImage->getFullUrl(),
                'altText' => $product->name,
                'width' => $featuredImage->getCustomProperty('width') ?? 800,
                'height' => $featuredImage->getCustomProperty('height') ?? 800,
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

    private function getOriginalPrice(Product $product): float
    {
        return round((float) $product->sale_price, 2);
    }

    private function getDiscountPercent(Product $product): float
    {
        return max(min((float) ($product->discount ?? 0), 100), 0);
    }

    private function getFinalPrice(Product $product): float
    {
        $originalPrice = $this->getOriginalPrice($product);
        $discount = $this->getDiscountPercent($product);

        if ($discount <= 0) {
            return $originalPrice;
        }

        return round($originalPrice * (1 - ($discount / 100)), 2);
    }
}
