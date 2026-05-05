<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Province;
use Illuminate\Support\Facades\File;

class ProvTableSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('provinces')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $jsonPath = database_path('seeders/provinces.json');
        $jsonContent = File::get($jsonPath);
        $data = json_decode($jsonContent, true);

        $provinces = $data['provincias'];
        $this->command->info('Importando ' . count($provinces) . ' provincias...');

        $idMapping = [];
        $dbId = 1;

        foreach ($provinces as $province) {
            $prov = Province::create([
                'id' => $dbId,
                'name' => $province['nombre'],
                'code' => $province['iso_id'] ?? null,
                'cost' => null,
            ]);
            $idMapping[$province['id']] = $dbId;
            $this->command->info("  Province: {$prov->name} (ID: {$prov->id})");
            $dbId++;
        }

        $this->command->info('Provincias insertadas: ' . count($provinces));

        // Store mapping for LocTableSeeder
        file_put_contents(storage_path('app/province_id_mapping.json'), json_encode($idMapping));
    }
}