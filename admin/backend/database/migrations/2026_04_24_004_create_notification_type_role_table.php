<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_type_role', function (Blueprint $table) {
            $table->foreignId('notification_type_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->primary(['notification_type_id', 'role_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_type_role');
    }
};