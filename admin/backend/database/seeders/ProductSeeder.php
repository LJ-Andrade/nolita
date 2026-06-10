<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductCategory;
use App\Models\ProductTag;
use App\Models\ProductSize;
use App\Models\ProductColor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class ProductSeeder extends Seeder
{
	public function run(): void
	{
		$this->cleanTables();

		$categories = ProductCategory::all();
		$sizes = ProductSize::all();
		$colors = ProductColor::all();

		if ($categories->isEmpty() || $sizes->isEmpty() || $colors->isEmpty()) {
			$this->command->warn('Product attributes missing. Run ProductAttributeSeeder first.');
			return;
		}
		$products_amount = 30;
		$this->command->info('Creating ' . $products_amount . ' products...');

		Product::factory()
			->count($products_amount)
			->published()
			->create()
			->each(function (Product $product) use ($sizes) {
				$selectedSizes = $sizes->random(min(3, $sizes->count()));
				$product->sizes()->sync($selectedSizes->pluck('id'));

				$selectedColors = $product->colors()->get();

				$variantsData = [];
				foreach ($selectedColors as $color) {
					foreach ($selectedSizes as $size) {
						$variantsData[] = [
							'product_id' => $product->id,
							'product_color_id' => $color->id,
							'product_size_id' => $size->id,
							'sku' => 'SKU-' . strtoupper(substr($product->code, -4)) . '-' . strtoupper(substr($color->name, 0, 3)) . '-' . strtoupper($size->name),
							'stock' => rand(5, 30),
							'min_stock' => rand(2, 8),
							'active' => true,
							'created_at' => now(),
							'updated_at' => now(),
						];
					}
				}

				DB::table('product_variants')->insert($variantsData);
			});

		$this->command->info('Products created successfully.');
	}

	private function cleanTables(): void
	{
		$products = Product::with('media')->get();

		foreach ($products as $product) {
			foreach ($product->media as $media) {
				$media->delete();
			}
		}

		$this->cleanMediaDirectory();

		DB::table('product_variants')->delete();
		DB::table('product_product_tag')->delete();
		DB::table('product_product_size')->delete();
		DB::table('product_product_color')->delete();
		Product::query()->delete();
	}

	private function cleanMediaDirectory(): void
	{
		$productsPath = 'products';
		if (Storage::disk('public')->exists($productsPath)) {
			Storage::disk('public')->deleteDirectory($productsPath);
		}
	}
}
