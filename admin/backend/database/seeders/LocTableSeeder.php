<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Locality;
use Illuminate\Support\Facades\File;

class LocTableSeeder extends Seeder
{
	public function run(): void
	{


		// Load province ID mapping
		$mappingPath = storage_path('app/province_id_mapping.json');
		if (!file_exists($mappingPath)) {
			$this->command->error('No se encontró el archivo de mapeo de provincias. Ejecutar ProvTableSeeder primero.');
			return;
		}
		$idMapping = json_decode(File::get($mappingPath), true);

		$jsonPath = database_path('seeders/localities.json');
		$jsonContent = File::get($jsonPath);
		$localities = json_decode($jsonContent, true);

		$this->command->info('Importando ' . count($localities) . ' localidades...');

		$count = 0;
		$errors = 0;

		foreach ($localities as $loc) {
			$jsonProvinceId = $loc['provincia_id'];
			$provinceDbId = $idMapping[$jsonProvinceId] ?? null;

			if (!$provinceDbId) {
				$errors++;
				$this->command->warn("  Localidad '{$loc['nombre']}' - Province ID '{$jsonProvinceId}' no encontrado");
				continue;
			}

			Locality::create([
				'name' => $loc['nombre'],
				'province_id' => $provinceDbId,
				'cost' => null,
			]);
			$count++;

			if ($count % 500 === 0) {
				$this->command->info("  {$count} localidades insertadas...");
			}
		}

		$this->command->info("Total localidades insertadas: {$count}");
		if ($errors > 0) {
			$this->command->warn("Localidades con errores (sin match de provincia): {$errors}");
		}
	}
}