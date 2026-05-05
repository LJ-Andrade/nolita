<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CustomMigrate extends Command
{
    protected $signature = 'cmigrate {action}';

    protected $description = 'Custom migrate -选择性重建数据库表';

    protected $groups = [
        '1' => ['name' => 'Provinces + Localities', 'tables' => ['provinces', 'localities'], 'seeders' => ['ProvTableSeeder', 'LocTableSeeder']],
        '2' => ['name' => 'Customers', 'tables' => ['customers'], 'seeders' => ['CustomerSeeder'], 'depends' => ['1']],
        '3' => ['name' => 'Products', 'tables' => ['products', 'product_variants', 'product_categories', 'product_tags', 'product_product_tag', 'product_product_color', 'product_product_size'], 'seeders' => ['ProductSeeder']],
        '4' => ['name' => 'Orders', 'tables' => ['orders', 'order_items'], 'seeders' => []],
        '5' => ['name' => 'All (migrate:fresh equivalent)', 'tables' => ['__all__'], 'seeders' => ['__all__']],
    ];

    public function handle()
    {
        $action = $this->argument('action');

        match ($action) {
            'list' => $this->listGroups(),
            'run' => $this->runMigrate(),
            default => $this->listGroups(),
        };
    }

    protected function listGroups()
    {
        $this->info("┌─────────────────────────────────────────────────────┐");
        $this->info("│  CUSTOM MIGRATE - Seleccioná qué resetear            │");
        $this->info("├─────────────────────────────────────────────────────┤");

        foreach ($this->groups as $key => $group) {
            $depends = isset($group['depends']) ? ' (requiere: ' . implode(', ', $group['depends']) . ')' : '';
            $seed = !empty($group['seeders']) ? ' [S]' : '';
            $this->line("  [$key] {$group['name']}{$seed}{$depends}");
        }

        $this->info("├─────────────────────────────────────────────────────┤");
        $this->info("│  Uso: php artisan cmigrate run                      │");
        $this->info("└─────────────────────────────────────────────────────┘");
    }

    protected function runMigrate()
    {
        $this->info("┌─────────────────────────────────────────────────────┐");
        $this->info("│  CUSTOM MIGRATE - Seleccioná qué resetear            │");
        $this->info("├─────────────────────────────────────────────────────┤");

        foreach ($this->groups as $key => $group) {
            $depends = isset($group['depends']) ? ' (→ ' . implode(', ', $group['depends']) . ')' : '';
            $seed = !empty($group['seeders']) ? ' [S]' : '';
            $this->line("  [$key] {$group['name']}{$seed}{$depends}");
        }

        $this->info("├─────────────────────────────────────────────────────┤");
        $this->info("│  Ej: 1,2,5  (múltiples separados por coma)           │");
        $this->info("│  o 'all' para seleccionar todo                      │");
        $this->info("└─────────────────────────────────────────────────────┘");

        $selection = $this->ask('Seleccioná opciones (ej: 1,2):');

        if ($selection === 'all') {
            $selectedKeys = array_keys($this->groups);
        } else {
            $selectedKeys = array_filter(array_map('trim', explode(',', $selection)));
        }

        // Validate selection
        $validKeys = array_keys($this->groups);
        foreach ($selectedKeys as $key) {
            if (!in_array($key, $validKeys)) {
                $this->error("Opción inválida: $key");
                return;
            }
        }

        // If 'all' selected, process in dependency order
        if (in_array('5', $selectedKeys)) {
            $selectedKeys = ['1', '2', '3', '4'];
        }

        // Add dependencies
        $keysToProcess = [];
        foreach ($selectedKeys as $key) {
            if (!in_array($key, $keysToProcess)) {
                $keysToProcess[] = $key;
            }
            if (isset($this->groups[$key]['depends'])) {
                foreach ($this->groups[$key]['depends'] as $dep) {
                    if (!in_array($dep, $keysToProcess)) {
                        $keysToProcess[] = $dep;
                    }
                }
            }
        }

        $this->info("");
        $this->info("Se procesará:");
        $tables = [];
        $seeders = [];
        foreach ($keysToProcess as $key) {
            $group = $this->groups[$key];
            $tables = array_merge($tables, $group['tables']);
            if (!empty($group['seeders'])) {
                $seeders = array_merge($seeders, $group['seeders']);
            }
            $this->line("  • {$group['name']}");
        }
        $this->info("");

        if (!$this->confirm('Continuar? (yes/no)')) {
            $this->info("Operación cancelada.");
            return;
        }

        $this->info("");

        // Truncate tables in correct order
        if (in_array('1', $keysToProcess)) {
            $this->truncateAndSeed(['provinces', 'localities'], ['ProvTableSeeder', 'LocTableSeeder']);
        }

        if (in_array('2', $keysToProcess)) {
            $this->truncateTable('customers');
        }

        if (in_array('3', $keysToProcess)) {
            $this->truncateTable('product_product_size');
            $this->truncateTable('product_product_color');
            $this->truncateTable('product_product_tag');
            $this->truncateTable('product_tags');
            $this->truncateTable('product_variants');
            $this->truncateTable('product_categories');
            $this->truncateTable('products');
        }

        if (in_array('4', $keysToProcess)) {
            $this->truncateTable('order_items');
            $this->truncateTable('orders');
        }

        $this->info("");
        $this->info("✓ Proceso completado");
    }

    protected function truncateTable($table)
    {
        try {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            DB::table($table)->truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
            $this->line("  ✓ Truncado: $table");
        } catch (\Exception $e) {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
            $this->warn("  ⚠ No se pudo truncar $table: " . $e->getMessage());
        }
    }

    protected function truncateAndSeed(array $tables, array $seeders)
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        foreach ($tables as $table) {
            DB::table($table)->truncate();
            $this->line("  ✓ Truncado: $table");
        }
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        if ($this->confirm('  ¿Seedear provinces y localities? (yes/no)')) {
            $this->call('db:seed', ['--class' => 'Database\\Seeders\\ProvTableSeeder']);
            $this->call('db:seed', ['--class' => 'Database\\Seeders\\LocTableSeeder']);
        }
    }
}