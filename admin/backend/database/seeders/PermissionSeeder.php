<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            ['name' => 'view products', 'display_name' => 'Ver productos'],
            ['name' => 'create products', 'display_name' => 'Crear productos'],
            ['name' => 'edit products', 'display_name' => 'Editar productos'],
            ['name' => 'delete products', 'display_name' => 'Eliminar productos'],
            ['name' => 'manage products', 'display_name' => 'Gestionar productos'],
            ['name' => 'view orders', 'display_name' => 'Ver pedidos'],
            ['name' => 'edit orders', 'display_name' => 'Editar pedidos'],
            ['name' => 'view profile', 'display_name' => 'Ver perfil'],
            ['name' => 'edit profile', 'display_name' => 'Editar perfil'],
            ['name' => 'users.view', 'display_name' => 'Ver usuarios'],
            ['name' => 'users.create', 'display_name' => 'Crear usuarios'],
            ['name' => 'users.edit', 'display_name' => 'Editar usuarios'],
            ['name' => 'users.delete', 'display_name' => 'Eliminar usuarios'],
            ['name' => 'roles.view', 'display_name' => 'Ver roles'],
            ['name' => 'roles.manage', 'display_name' => 'Gestionar roles'],
            ['name' => 'view activity logs', 'display_name' => 'Ver registros de actividad'],
            ['name' => 'system.manage', 'display_name' => 'Gestionar sistema'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name'], 'guard_name' => 'web'],
                ['display_name' => $permission['display_name']]
            );
        }
    }
}
