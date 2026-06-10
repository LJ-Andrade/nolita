<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCategoryResource;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductTag;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
	/**
	 * Get all active products with variants and categories.
	 */
	public function products(Request $request)
	{
		$mode = $this->resolvePriceMode($request->query('mode'));
		$query = Product::where('status', 'published')
			->with(['category', 'tags', 'variants.color', 'variants.size', 'colors', 'sizes', 'media']);

		if ($request->has('category')) {
			$query->whereHas('category', function ($q) use ($request) {
				$q->where('slug', $request->category);
			});
		}

		if ($request->has('search')) {
			$search = $request->search;
			$query->where(function ($q) use ($search) {
				$q->where('name', 'like', "%{$search}%")
					->orWhere('description', 'like', "%{$search}%");
			});
		}

		if ($mode === 'wholesale') {
			$query->where('hide_on_wholesale', false)
				->where('wholesale_price', '>', 0);
		} else {
			$query->where('sale_price', '>', 0);
		}

		$products = $query->orderBy('created_at', 'desc')->get();

		// Transform for Next.js Commerce expectation
		$transformed = $products->map(function (Product $product) use ($mode) {
			return $this->transformProduct($product, $mode);
		});

		return response()->json($transformed);
	}

	/**
	 * Get a single product by slug or ID.
	 */
	public function product(string $slug)
	{
		$mode = $this->resolvePriceMode(request()->query('mode'));
		$product = Product::where('status', 'published')
			->where(function ($q) use ($slug) {
				$q->where('slug', $slug)->orWhere('id', $slug);
			})
			->with(['category', 'tags', 'variants.color', 'variants.size', 'colors', 'sizes', 'media'])
			->firstOrFail();

		return response()->json($this->transformProduct($product, $mode));
	}

	/**
	 * Get all categories.
	 */
	public function categories(Request $request)
	{
		$query = ProductCategory::orderBy('order');

		if ($request->has('listed')) {
			$query->where('listed', $request->listed == 'true' || $request->listed == '1');
		}

		$categories = $query->get();

		return ProductCategoryResource::collection($categories);
	}

	/**
	 * Helper to transform product to the format expected by the frontend.
	 */
	private function transformProduct(Product $product, string $mode = 'retail')
	{
		$originalPrice = $this->getOriginalPrice($product, $mode);
		$finalPrice = $this->getFinalPrice($product, $mode);
		$discount = $this->getDiscountPercent($product, $mode);
		$retailDiscount = $this->getDiscountPercent($product, 'retail');
		$wholesaleDiscount = $this->getDiscountPercent($product, 'wholesale');
		$hasDiscount = $discount > 0 && $finalPrice < $originalPrice;
		$compareAtPrice = $hasDiscount ? [
			'amount' => (string) $originalPrice,
			'currencyCode' => '$',
		] : null;
		$finalPricePayload = [
			'amount' => (string) $finalPrice,
			'currencyCode' => '$',
		];

		return [
			'id' => (string) $product->id,
			'handle' => $product->slug,
			'availableForSale' => true,
			'title' => $product->name,
			'description' => $product->description,
			'descriptionHtml' => $product->description,
			'fabric' => $product->fabric,
			'options' => $this->getProductOptions($product),
			'priceRange' => [
				'maxVariantPrice' => $finalPricePayload,
				'minVariantPrice' => $finalPricePayload,
			],
			'compareAtPriceRange' => $hasDiscount ? [
				'maxVariantPrice' => $compareAtPrice,
				'minVariantPrice' => $compareAtPrice,
			] : null,
			'priceMode' => $mode,
			'salePrice' => (string) round((float) $product->sale_price, 2),
			'wholesalePrice' => $product->wholesale_price !== null ? (string) round((float) $product->wholesale_price, 2) : null,
			'hideOnWholesale' => (bool) $product->hide_on_wholesale,
			'discount' => $discount,
			'retailDiscount' => $retailDiscount,
			'wholesaleDiscount' => $wholesaleDiscount,
			'hasDiscount' => $hasDiscount,
			'variants' => $product->variants->map(function ($variant) use ($finalPricePayload, $compareAtPrice, $discount, $hasDiscount) {
				return [
					'id' => (string) $variant->id,
					'title' => $this->getVariantTitle($variant),
					'availableForSale' => $variant->stock > 0 && $variant->active,
					'quantityAvailable' => (int) ($variant->stock ?? 0),
					'selectedOptions' => $this->getVariantOptions($variant),
					'price' => $finalPricePayload,
					'compareAtPrice' => $compareAtPrice,
					'discount' => $discount,
					'hasDiscount' => $hasDiscount,
				];
			}),
			'images' => $this->getProductImages($product),
			'featuredImage' => $this->getProductCover($product),
			'seo' => [
				'title' => $product->name,
				'description' => $product->description,
			],
			'category' => $product->category ? [
				'handle' => $product->category->slug,
				'title' => $product->category->name,
			] : null,
			'tags' => $product->tags->pluck('name')->toArray(),
			'createdAt' => $product->created_at->toISOString(),
			'updatedAt' => $product->updated_at->toISOString(),
			'colorImages' => $product->getMedia('color_images')->map(function ($media) use ($product) {
				$color = $product->colors->firstWhere('id', $media->getCustomProperty('color_id'));
				if (!$color)
					return null;
				return [
					'color' => $color->name,
					'hex' => $color->hex_color,
					'url' => $media->getFullUrl(),
				];
			})->filter()->values()->toArray(),
		];
	}

	private function getOriginalPrice(Product $product, string $mode = 'retail'): float
	{
		if ($mode === 'wholesale') {
			return round((float) ($product->wholesale_price ?? 0), 2);
		}

		return round((float) $product->sale_price, 2);
	}

	private function getDiscountPercent(Product $product, string $mode = 'retail'): float
	{
		$field = $mode === 'wholesale' ? 'wholesale_discount' : 'discount';

		return max(min((float) ($product->{$field} ?? 0), 100), 0);
	}

	private function getFinalPrice(Product $product, string $mode = 'retail'): float
	{
		$originalPrice = $this->getOriginalPrice($product, $mode);
		$discount = $this->getDiscountPercent($product, $mode);

		if ($discount <= 0) {
			return $originalPrice;
		}

		return round($originalPrice * (1 - ($discount / 100)), 2);
	}

	private function resolvePriceMode(?string $mode): string
	{
		return $mode === 'wholesale' ? 'wholesale' : 'retail';
	}

	private function getProductOptions(Product $product)
	{
		$options = [];

		$colors = $product->variants->pluck('color')->filter()->unique('id');
		if ($colors->isEmpty() && $product->relationLoaded('colors')) {
			$colors = $product->colors->filter()->unique('id');
		}
		if ($colors->isNotEmpty()) {
			$options[] = [
				'id' => 'color',
				'name' => 'Color',
				'values' => $colors->pluck('name')->toArray(),
				'hexValues' => $colors->pluck('hex_color')->toArray(),
			];
		}

		$sizes = $product->variants->pluck('size')->filter()->unique('id');
		if ($sizes->isEmpty() && $product->relationLoaded('sizes')) {
			$sizes = $product->sizes->filter()->unique('id');
		}
		if ($sizes->isNotEmpty()) {
			$options[] = [
				'id' => 'size',
				'name' => 'Talle',
				'values' => $sizes->pluck('name')->toArray(),
			];
		}

		return $options;
	}

	private function getVariantTitle($variant)
	{
		$parts = [];
		if ($variant->color)
			$parts[] = $variant->color->name;
		if ($variant->size)
			$parts[] = $variant->size->name;
		return implode(' / ', $parts) ?: 'Default';
	}

	private function getVariantOptions($variant)
	{
		$options = [];
		if ($variant->color) {
			$options[] = ['name' => 'Color', 'value' => $variant->color->name];
		}
		if ($variant->size) {
			$options[] = ['name' => 'Talle', 'value' => $variant->size->name];
		}
		return $options;
	}

	private function getProductImages(Product $product)
	{
		$images = $product->getMedia('gallery')
			->sortBy('order_column')
			->values()
			->map(fn ($media) => $this->imagePayload($media->getFullUrl(), $product->name))
			->toArray();

		if (empty($images)) {
			$legacyCover = $product->getFirstMediaUrl('cover');
			if ($legacyCover) {
				$images[] = $this->imagePayload($legacyCover, $product->name);
			}
		}

		return $images;
	}

	private function getProductCover(Product $product)
	{
		$images = $this->getProductImages($product);

		return $images[0] ?? null;
	}

	private function imagePayload(string $url, string $altText): array
	{
		return [
			'url' => $url,
			'width' => 1000,
			'height' => 1000,
			'altText' => $altText,
		];
	}
}
