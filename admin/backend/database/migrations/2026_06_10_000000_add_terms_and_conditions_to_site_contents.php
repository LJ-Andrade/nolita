<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\SiteContent;

return new class extends Migration
{
    public function up(): void
    {
        SiteContent::updateOrCreate(
            ['key' => 'home_terms_and_conditions'],
            [
                'value' => '',
                'section' => 'home',
                'type' => 'rich-text',
                'description' => 'Terms and conditions page content',
            ]
        );
    }

    public function down(): void
    {
        SiteContent::where('key', 'home_terms_and_conditions')->delete();
    }
};
