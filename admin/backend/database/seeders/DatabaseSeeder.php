<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
	use WithoutModelEvents;

	/**
	 * Seed the application's database.
	 */
	public function run(): void
	{
		// User::factory(10)->create();

		$this->call([
			ProductAttributeSeeder::class,
			PermissionSeeder::class,
			RoleSeeder::class,
			NotificationTypeSeeder::class,
			PaymentMethodSeeder::class,
			DeliveryMethodSeeder::class,
			CustomerSeeder::class,
		]);

		$javzero = User::firstOrCreate(
			['email' => 'javzero1@gmail.com'],
			[
				'name' => 'Leandro Andrade',
				'password' => bcrypt('12121212'),
			]
		);
		$javzero->syncRoles(['Super Admin']);

		$violeta = User::firstOrCreate(
			['email' => 'violetaraffin@gmail.com'],
			[
				'name' => 'Violeta Raffin',
				'password' => bcrypt('12121212'),
			]
		);
		// $violeta->syncRoles(['Admin']);
		$violeta->syncRoles(['Employee']);

		$geo = User::firstOrCreate(
			['email' => 'geo@gmail.com'],
			[
				'name' => 'Geo Georgie',
				'password' => bcrypt('12121212'),
			]
		);
		$geo->syncRoles(['Employee']);

		$this->call([
			CategorySeeder::class,
			TagSeeder::class,
			BusinessSettingsSeeder::class,
			ProductSeeder::class,
			PostSeeder::class,
		]);
	}
}
