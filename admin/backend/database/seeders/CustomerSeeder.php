<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
	public function run(): void
	{
		$customers = [
			[
				'name' => 'Leandro Andrade',
				'email' => 'javzero1@gmail.com',
				'password' => Hash::make('12121212'),
				'phone' => '1234567890',
				'address' => 'Calle Falsa 123',
				'postal_code' => '1000',
				'is_active' => true,
			],
			[
				'name' => 'Violeta Raffin',
				'email' => 'violeta.raffin@example.com',
				'password' => Hash::make('12121212'),
				'phone' => '1234567890',
				'address' => 'Calle Falsa 123',
				'postal_code' => '1000',
				'is_active' => true,
			],
			[
				'name' => 'Geo ',
				'email' => 'geo@gmail.com',
				'password' => Hash::make('12121212'),
				'phone' => '1234567890',
				'address' => 'Calle Falsa 123',
				'postal_code' => '1000',
				'is_active' => true,
			],
		];


		foreach ($customers as $customer) {
			Customer::firstOrCreate(
				['email' => $customer['email']],
				$customer
			);
		}
	}
}
