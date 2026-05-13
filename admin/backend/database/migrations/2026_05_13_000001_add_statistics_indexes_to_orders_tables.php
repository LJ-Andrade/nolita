<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->index(['status', 'created_at'], 'orders_status_created_at_index');
        });

        Schema::table('order_items', function (Blueprint $table): void {
            $table->index(['order_id', 'product_id'], 'order_items_order_product_index');
            $table->index(['product_id', 'order_id'], 'order_items_product_order_index');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table): void {
            $table->dropIndex('order_items_product_order_index');
            $table->dropIndex('order_items_order_product_index');
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->dropIndex('orders_status_created_at_index');
        });
    }
};
