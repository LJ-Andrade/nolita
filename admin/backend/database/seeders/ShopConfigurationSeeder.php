<?php

namespace Database\Seeders;

use App\Models\ShopConfiguration;
use Illuminate\Database\Seeder;

class ShopConfigurationSeeder extends Seeder
{
    public function run(): void
    {
        ShopConfiguration::firstOrCreate([], [
            'min_quantity' => 0,
            'min_amount' => 0.00,
        ]);
    }
}
