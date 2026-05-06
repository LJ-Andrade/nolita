<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_configurations', function (Blueprint $table) {
            $table->id();
            $table->integer('min_quantity')->default(0);
            $table->decimal('min_amount', 10, 2)->default(0.00);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_configurations');
    }
};
