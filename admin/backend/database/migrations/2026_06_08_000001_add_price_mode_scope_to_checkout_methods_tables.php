<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['coupons', 'payment_methods', 'delivery_methods'] as $tableName) {
            if (!Schema::hasTable($tableName) || Schema::hasColumn($tableName, 'price_mode_scope')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table): void {
                $table->string('price_mode_scope', 20)->default('both')->after('id');
            });
        }
    }

    public function down(): void
    {
        foreach (['coupons', 'payment_methods', 'delivery_methods'] as $tableName) {
            if (!Schema::hasTable($tableName) || !Schema::hasColumn($tableName, 'price_mode_scope')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropColumn('price_mode_scope');
            });
        }
    }
};
