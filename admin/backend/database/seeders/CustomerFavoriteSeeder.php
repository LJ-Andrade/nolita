<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerFavoriteSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::query()
            ->orderBy('id')
            ->pluck('id')
            ->values();

        if ($products->isEmpty()) {
            $this->command?->warn('No products found. Skipping customer favorites seeding.');
            return;
        }

        $customers = collect([
            ['name' => 'Camila Torres', 'email' => 'camila.torres@example.com'],
            ['name' => 'Martina Silva', 'email' => 'martina.silva@example.com'],
            ['name' => 'Sofia Romero', 'email' => 'sofia.romero@example.com'],
            ['name' => 'Valentina Castro', 'email' => 'valentina.castro@example.com'],
            ['name' => 'Lucia Fernandez', 'email' => 'lucia.fernandez@example.com'],
            ['name' => 'Agustina Molina', 'email' => 'agustina.molina@example.com'],
            ['name' => 'Julieta Rios', 'email' => 'julieta.rios@example.com'],
            ['name' => 'Florencia Vega', 'email' => 'florencia.vega@example.com'],
            ['name' => 'Renata Suarez', 'email' => 'renata.suarez@example.com'],
            ['name' => 'Emilia Navarro', 'email' => 'emilia.navarro@example.com'],
        ])->map(fn (array $data, int $index): Customer => Customer::firstOrCreate(
            ['email' => $data['email']],
            [
                'name' => $data['name'],
                'password' => Hash::make('12121212'),
                'phone' => '110000' . str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                'address' => 'Demo Street ' . ($index + 1),
                'postal_code' => '1000',
                'is_active' => true,
            ]
        ));

        $customers->each(function (Customer $customer, int $index) use ($products): void {
            $favoriteCount = min($products->count(), 1 + ($index % 4));
            $favoriteIds = [];

            for ($offset = 0; $offset < $favoriteCount; $offset++) {
                $favoriteIds[] = $products[($index + $offset) % $products->count()];
            }

            if ($index % 3 === 0 && $products->count() > 1) {
                $favoriteIds[] = $products->first();
            }

            $customer->favorites()->syncWithoutDetaching(array_unique($favoriteIds));
        });
    }
}
