<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('code', 100)->nullable();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->string('fabric')->nullable();
            
            // Pricing
            $table->decimal('cost_price', 15, 2)->nullable();
            $table->decimal('sale_price', 15, 2)->default(0);
            $table->decimal('wholesale_price', 15, 2)->nullable();
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('wholesale_discount', 10, 2)->default(0);

            // Stock
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(0);

            // Images and Config
            $table->string('thumb')->nullable();
            $table->json('gallery')->nullable();
            $table->boolean('featured')->default(false);
            $table->boolean('hide_on_wholesale')->default(false);
            $table->integer('order')->default(0);
            
            // Status and SEO
            $table->string('status')->default('draft');
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            $table->unsignedBigInteger('user_id');
            $table->text('qr_url')->nullable();
            $table->timestamps();

            // Relations
            $table->foreign('category_id')->references('id')->on('product_categories')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
