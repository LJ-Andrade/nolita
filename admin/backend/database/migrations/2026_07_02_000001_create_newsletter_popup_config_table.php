<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletter_popup_config', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_enabled')->default(true);
            $table->unsignedInteger('delay_seconds')->default(3);
            $table->string('title')->nullable();
            $table->text('subtitle')->nullable();
            $table->string('name_label')->nullable();
            $table->string('name_placeholder')->nullable();
            $table->string('email_label')->nullable();
            $table->string('email_placeholder')->nullable();
            $table->text('customer_type_text')->nullable();
            $table->string('submit_text')->nullable();
            $table->string('dismiss_text')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_popup_config');
    }
};
