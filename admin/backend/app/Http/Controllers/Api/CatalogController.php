<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
		$query = Product::where('status', 'published')
			->with(['category', 'tags', 'variants.color', 'variants.size', 'colors', 'media']);

		if ($request->has('category')) {
			$query->whereHas('category', function ($q) use ($request) {
				$q->where('slug', $request->category);
			});
		}

		if ($request->has('featured')) {
			$query->where('featured', true);
		}

		if ($request->has('search')) {
			$search = $request->search;
			$query->where(function ($q) use ($search) {
				$q->where('name', 'like', "%{$search}%")
					->orWhere('description', 'like', "%{$search}%");
			});
		}

		$products = $query->orderBy('order')->get();

		// Transform for Next.js Commerce expectation
		$transformed = $products->map(function (Product $product) {
			return $this->transformProduct($product);
		});

		return response()->json($transformed);
	}

	/**
	 * Get a single product by slug or ID.
	 */
	public function product(string $slug)
	{
		$product = Product::where('status', 'published')
			->where(function ($q) use ($slug) {
				$q->where('slug', $slug)->orWhere('id', $slug);
			})
			->with(['category', 'tags', 'variants.color', 'variants.size', 'colors', 'media'])
			->firstOrFail();

		return response()->json($this->transformProduct($product));
	}

	/**
	 * Get all categories.
	 */
	public function categories()
	{
		$categories = ProductCategory::orderBy('name')
			->get();

		return response()->json($categories);
	}

	/**
	 * Helper to transform product to the format expected by the frontend.
	 */
	private function transformProduct(Product $product)
	{
		return [
			'id' => (string) $product->id,
			'handle' => $product->slug,
			'availableForSale' => true,
			'title' => $product->name,
			'description' => $product->description,
			'descriptionHtml' => $product->description,
			'options' => $this->getProductOptions($product),
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
			'variants' => $product->variants->map(function ($variant) {
				return [
					'id' => (string) $variant->id,
					'title' => $this->getVariantTitle($variant),
					'availableForSale' => $variant->stock > 0 && $variant->active,
					'quantityAvailable' => (int) ($variant->stock ?? 0),
					'selectedOptions' => $this->getVariantOptions($variant),
					'price' => [
						'amount' => (string) ($variant->price ?? $variant->product->sale_price),
						'currencyCode' => '$',
					],
				];
			}),
			'images' => $this->getProductImages($product),
			'featuredImage' => $this->getProductCover($product),
			'seo' => [
				'title' => $product->name,
				'description' => $product->description,
			],
			'tags' => $product->tags->pluck('name')->toArray(),
			'updatedAt' => $product->updated_at->toISOString(),
			'colorImages' => $product->getMedia('color_images')->map(function ($media) use ($product) {
				$color = $product->colors->firstWhere('id', $media->getCustomProperty('color_id'));
				if (!$color)
					return null;
				return [
					'color' => $color->name,
					'url' => $media->getFullUrl(),
				];
			})->filter()->values()->toArray(),
		];
	}

	private function getProductOptions(Product $product)
	{
		$options = [];

		$colors = $product->variants->pluck('color')->filter()->unique('id');
		if ($colors->isNotEmpty()) {
			$options[] = [
				'id' => 'color',
				'name' => 'Color',
				'values' => $colors->pluck('name')->toArray(),
			];
		}

		$sizes = $product->variants->pluck('size')->filter()->unique('id');
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
		$images = [];
		foreach ($product->getMedia('gallery') as $media) {
			$images[] = [
				'url' => $media->getFullUrl(),
				'width' => 1000,
				'height' => 1000,
				'altText' => $product->name,
			];
		}
		// Also include cover if not in gallery
		$cover = $product->getFirstMediaUrl('cover');
		if ($cover) {
			// Check if already in gallery (simplistic check)
			$images = array_merge([
				[
					'url' => $cover,
					'width' => 1000,
					'height' => 1000,
					'altText' => $product->name,
				]
			], $images);
		}
		return $images;
	}

	private function getProductCover(Product $product)
	{
		$url = $product->getFirstMediaUrl('cover');
		if (!$url)
			return null;
		return [
			'url' => $url,
			'width' => 1000,
			'height' => 1000,
			'altText' => $product->name,
		];
	}
}
