<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductTag;
use App\Models\ProductSize;
use App\Models\ProductColor;
use App\Models\User;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    private static int $imageCounter = 0;

    private static array $fabricTypes = [
        'Algodón 100%',
        'Poliester premium',
        'Mezcla algodón-poliester',
        'Lino natural',
        'Denim resistente',
        'Seda italiana',
        'Viscosa suave',
        'Franela caliente',
        'Cachemira puro',
        'Algodón orgánico',
    ];

    private static array $productTypes = [
        'Camisa',
        'Polo',
        'Remera',
        'Pantalón',
        'Jeans',
        'Short',
        'Chaqueta',
        'Sweater',
        'Buzo',
        'Vestido',
        'Falda',
        'Blusa',
        'Cardigan',
        'Abrigo',
        'Camisa de lino',
        'Pantalón de vestir',
    ];

    private static array $adjectives = [
        'Clásico',
        'Moderno',
        'Elegante',
        'Casual',
        'Premium',
        'Básico',
        'De lujo',
        'Vintage',
        'Minimalista',
        'Sofisticado',
    ];

    public function definition(): array
    {
        $faker = FakerFactory::create(config('app.faker_locale', 'en_US'));
        $productType = $faker->randomElement(self::$productTypes);
        $adjective = $faker->randomElement(self::$adjectives);
        $name = "{$adjective} {$productType}";
        $costPrice = $faker->randomFloat(2, 150, 800);

        return [
            'name' => $name,
            'code' => 'PRD-' . strtoupper(Str::random(6)),
            'slug' => Str::slug($name) . '-' . Str::random(4),
            'description' => $faker->paragraph(3),
            'fabric' => $faker->randomElement(self::$fabricTypes),
            'cost_price' => $costPrice,
            'sale_price' => $costPrice * $faker->randomFloat(2, 1.3, 2.0),
            'wholesale_price' => $costPrice * $faker->randomFloat(2, 1.15, 1.4),
            'discount' => $faker->optional(weight: 0.3)->randomFloat(2, 5, 30) ?? 0,
            'stock' => $faker->numberBetween(10, 100),
            'min_stock' => $faker->numberBetween(5, 20),
            'featured' => $faker->boolean(20),
            'order' => $faker->numberBetween(0, 100),
            'status' => $faker->randomElement(['draft', 'published']),
            'user_id' => User::inRandomOrder()->first()->id ?? 1,
            'category_id' => ProductCategory::inRandomOrder()->first()->id ?? null,
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Product $product) {
            $faker = FakerFactory::create(config('app.faker_locale', 'en_US'));

            $selectedTags = ProductTag::inRandomOrder()
                ->limit($faker->numberBetween(2, 5))
                ->pluck('id');

            $selectedSizes = ProductSize::inRandomOrder()
                ->limit($faker->numberBetween(2, 4))
                ->pluck('id');

            $selectedColors = ProductColor::inRandomOrder()
                ->limit($faker->numberBetween(1, 3))
                ->pluck('id');

            $product->tags()->sync($selectedTags);
            $product->sizes()->sync($selectedSizes);
            $product->colors()->sync($selectedColors);

            $this->downloadAndAttachImages($product, $selectedColors);
        });
    }

    private function downloadAndAttachImages(Product $product, $colorIds): void
    {
        self::$imageCounter++;
        $seed = $product->id ?? self::$imageCounter;
        $storagePath = 'products';

        try {
            if (!Storage::disk('public')->exists($storagePath)) {
                Storage::disk('public')->makeDirectory($storagePath);
            }

            $coverUrl = "https://picsum.photos/seed/{$seed}/800/1000";
            $coverContent = $this->downloadImage($coverUrl);

            if (is_string($coverContent) && $coverContent !== '') {
                $coverFilename = "{$storagePath}/{$product->id}_cover_" . time() . ".jpg";
                Storage::disk('public')->put($coverFilename, $coverContent);
                $product->addMedia(Storage::disk('public')->path($coverFilename))
                    ->preservingOriginal()
                    ->toMediaCollection('cover');
            }

            for ($i = 0; $i < 2; $i++) {
                $galleryUrl = "https://picsum.photos/seed/{$seed}_gallery_{$i}/800/1000";
                $galleryContent = $this->downloadImage($galleryUrl);

                if (is_string($galleryContent) && $galleryContent !== '') {
                    $galleryFilename = "{$storagePath}/{$product->id}_gallery_{$i}_" . time() . ".jpg";
                    Storage::disk('public')->put($galleryFilename, $galleryContent);
                    $product->addMedia(Storage::disk('public')->path($galleryFilename))
                        ->preservingOriginal()
                        ->toMediaCollection('gallery');
                }
            }

            $colors = ProductColor::whereIn('id', $colorIds)->get();
            foreach ($colors as $index => $color) {
                $colorSeed = $seed . '_color_' . $color->id;
                $colorUrl = "https://picsum.photos/seed/{$colorSeed}/800/1000";
                $colorContent = $this->downloadImage($colorUrl);

                if (is_string($colorContent) && $colorContent !== '') {
                    $colorFilename = "{$storagePath}/{$product->id}_color_{$color->id}_" . time() . ".jpg";
                    Storage::disk('public')->put($colorFilename, $colorContent);
                    $product->addMedia(Storage::disk('public')->path($colorFilename))
                        ->preservingOriginal()
                        ->withCustomProperties(['color_id' => $color->id])
                        ->toMediaCollection('color_images');
                }
            }
        } catch (\Exception $e) {
            // Silent fail - images are optional for factory
        }
    }

    private function downloadImage(string $url): ?string
    {
        try {
            $response = Http::timeout(5)->get($url);

            if ($response->successful()) {
                return $response->body();
            }
        } catch (\Exception $e) {
            // Images are optional seed data.
        }

        return null;
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'featured' => true,
        ]);
    }
}
