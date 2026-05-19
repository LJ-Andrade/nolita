<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
	use WithoutModelEvents;

	public function run(): void
	{
		$this->call([
			ProvTableSeeder::class,
			LocTableSeeder::class,
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
		$violeta->syncRoles(['Employee']);

		$nolita = User::firstOrCreate(
			['email' => 'nolita@gmail.com'],
			[
				'name' => 'Nolita',
				'password' => bcrypt('12121212'),
			]
		);
		$nolita->syncRoles(['Employee']);

        $this->call([
            CategorySeeder::class,
            TagSeeder::class,
            BusinessSettingsSeeder::class,
            SiteContentSeeder::class,
            ShopConfigurationSeeder::class,
            ProductSeeder::class,
            CustomerFavoriteSeeder::class,
            OrderSeeder::class,
            PostSeeder::class,
        ]);
	}
}
