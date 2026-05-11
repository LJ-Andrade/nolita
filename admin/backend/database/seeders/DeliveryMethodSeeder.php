<?php

namespace Database\Seeders;

use App\Models\DeliveryMethod;
use Illuminate\Database\Seeder;

class DeliveryMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'name' => 'Correo Argentino',
                'description' => 'El costo del envío será informado próximamente',
                'fee' => 0,
            ],
        ];

        foreach ($methods as $method) {
            DeliveryMethod::firstOrCreate(
                ['name' => $method['name']],
                $method
            );
        }
    }
}
