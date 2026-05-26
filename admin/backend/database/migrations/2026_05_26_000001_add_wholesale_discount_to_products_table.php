<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('products')) {
            return;
        }

        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'fabric')) {
                $table->string('fabric')->nullable()->after('description');
            }

            if (!Schema::hasColumn('products', 'wholesale_discount')) {
                $table->decimal('wholesale_discount', 10, 2)->default(0)->after('discount');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('products')) {
            return;
        }

        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'fabric')) {
                $table->dropColumn('fabric');
            }

            if (Schema::hasColumn('products', 'wholesale_discount')) {
                $table->dropColumn('wholesale_discount');
            }
        });
    }
};
