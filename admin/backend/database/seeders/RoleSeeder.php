<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $roles = [
            ['name' => 'Super Admin', 'display_name' => 'Super Administrador', 'guard_name' => 'web'],
            ['name' => 'Admin', 'display_name' => 'Administrador', 'guard_name' => 'web'],
            ['name' => 'Employee', 'display_name' => 'Empleado', 'guard_name' => 'web'],
        ];

        foreach ($roles as $roleData) {
            Role::updateOrCreate(['name' => $roleData['name']], $roleData);
        }

        $permissions = Permission::all();

        Role::where('name', 'Super Admin')->first()?->syncPermissions($permissions);
        Role::where('name', 'Admin')->first()?->syncPermissions($permissions);

        $employeePermissions = Permission::whereIn('name', [
            'view products',
            'create products',
            'edit products',
            'manage products',
            'view orders',
            'view profile',
            'edit profile',
        ])->get();

        Role::where('name', 'Employee')->first()?->syncPermissions($employeePermissions);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
