<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('stock_deducted_at')->nullable()->after('payment_status');
        });

        // Checked-out orders that are still active already had their stock subtracted at checkout.
        DB::table('orders')
            ->whereNotNull('customer_data')
            ->whereIn('status', ['pending', 'processing', 'completed'])
            ->update(['stock_deducted_at' => DB::raw('updated_at')]);
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('stock_deducted_at');
        });
    }
};
