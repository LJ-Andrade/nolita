<?php

namespace Database\Seeders;

use App\Models\NotificationType;
use App\Models\Role;
use Illuminate\Database\Seeder;

class NotificationTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'key' => 'order.created',
                'name' => 'Nuevo Pedido',
                'description' => 'Se recibe un nuevo pedido en el sistema',
                'roles' => ['Super Admin', 'Admin', 'Employee'],
            ],
            [
                'key' => 'order.updated',
                'name' => 'Pedido Actualizado',
                'description' => 'El estado de un pedido ha sido actualizado',
                'roles' => ['Super Admin', 'Admin', 'Employee'],
            ],
            [
                'key' => 'category.created',
                'name' => 'Categoría Creada',
                'description' => 'Se ha creado una nueva categoría de productos',
                'roles' => ['Super Admin', 'Admin'],
            ],
            [
                'key' => 'product.created',
                'name' => 'Producto Creado',
                'description' => 'Se ha creado un nuevo producto',
                'roles' => ['Super Admin', 'Admin', 'Employee'],
            ],
        ];

        foreach ($types as $typeData) {
            $roles = $typeData['roles'];
            unset($typeData['roles']);

            $notificationType = NotificationType::updateOrCreate(
                ['key' => $typeData['key']],
                $typeData
            );

            $roleModels = Role::whereIn('name', $roles)->get();
            $notificationType->roles()->sync($roleModels->pluck('id'));
        }
    }
}