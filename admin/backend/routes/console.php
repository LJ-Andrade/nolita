<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('migrate:permissions {--fresh : Drop tables first}', function () {
    $this->info('Migrating permissions tables...');

    if ($this->option('fresh')) {
        $this->warn('Dropping existing permission tables...');
        \Illuminate\Support\Facades\Schema::dropIfExists('notification_type_role');
        \Illuminate\Support\Facades\Schema::dropIfExists('model_has_permissions');
        \Illuminate\Support\Facades\Schema::dropIfExists('model_has_roles');
        \Illuminate\Support\Facades\Schema::dropIfExists('role_has_permissions');
        \Illuminate\Support\Facades\Schema::dropIfExists('permissions');
        \Illuminate\Support\Facades\Schema::dropIfExists('roles');
        
        \Illuminate\Support\Facades\DB::table('migrations')
            ->where('migration', 'like', '%create_permission_tables%')
            ->delete();
        
        $this->info('Tables dropped and migration history cleaned.');
    }

    $this->call('migrate', [
        '--path' => 'database/migrations/2026_04_24_000001_create_permission_tables.php',
        '--force' => true
    ]);

    $this->info('Seeding permissions and roles...');
    $this->call('db:seed', ['--class' => 'Database\Seeders\PermissionSeeder', '--force' => true]);
    $this->call('db:seed', ['--class' => 'Database\Seeders\RoleSeeder', '--force' => true]);

    $this->info('Assigning roles to users...');

    $javzero = \App\Models\User::where('email', 'javzero1@gmail.com')->first();
    if ($javzero) {
        $javzero->syncRoles(['Super Admin']);
        $this->info("Assigned Super Admin role to {$javzero->email}");
    }

    $violeta = \App\Models\User::where('email', 'violetaraffin@gmail.com')->first();
    if ($violeta) {
        $violeta->syncRoles(['Admin']);
        $this->info("Assigned Admin role to {$violeta->email}");
    }

    $geo = \App\Models\User::where('email', 'geo@gmail.com')->first();
    if ($geo) {
        $geo->syncRoles(['Employee']);
        $this->info("Assigned Employee role to {$geo->email}");
    }

    $this->info('Permissions tables migrated and seeded successfully!');
})->purpose('Migrate only the permissions tables');
