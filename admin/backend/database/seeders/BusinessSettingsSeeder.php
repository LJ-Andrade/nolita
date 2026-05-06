<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use App\Models\SiteContent;
use Illuminate\Database\Seeder;

class BusinessSettingsSeeder extends Seeder
{
    public function run(): void
    {
        SystemSetting::whereIn('key', SiteContent::BUSINESS_KEYS)->delete();

        $settings = [
            ['key' => 'mail_to_address', 'value' => '', 'description' => 'Contact form destination email'],
            ['key' => 'business_name', 'value' => '', 'description' => 'Business name displayed in the admin sidebar'],
            ['key' => 'language_default_mode', 'value' => 'light', 'description' => 'Default language mode (light/dark)'],
            ['key' => 'language_toggle_enabled', 'value' => 'true', 'description' => 'Enable language toggle'],

            // Skin settings
            ['key' => 'skin_light_sidebar_bg', 'value' => '#f0f0f0', 'description' => 'Sidebar background color (light mode)'],
            ['key' => 'skin_light_sidebar_foreground', 'value' => '#333333', 'description' => 'Sidebar text color (light mode)'],
            ['key' => 'skin_light_sidebar_accent', 'value' => '#d9d9d9', 'description' => 'Sidebar accent color (light mode)'],
            ['key' => 'skin_light_sidebar_border', 'value' => '#d1d5db', 'description' => 'Sidebar border color (light mode)'],
            ['key' => 'skin_light_gradient_start', 'value' => '#e0e7ff', 'description' => 'Gradient start color (light mode)'],
            ['key' => 'skin_light_gradient_end', 'value' => '#f5f5f5', 'description' => 'Gradient end color (light mode)'],
            ['key' => 'skin_dark_sidebar_bg', 'value' => '#0d0d14', 'description' => 'Sidebar background color (dark mode)'],
            ['key' => 'skin_dark_sidebar_foreground', 'value' => '#f5f5f5', 'description' => 'Sidebar text color (dark mode)'],
            ['key' => 'skin_dark_sidebar_accent', 'value' => '#1e1e2a', 'description' => 'Sidebar accent color (dark mode)'],
            ['key' => 'skin_dark_sidebar_border', 'value' => '#1e1e2a', 'description' => 'Sidebar border color (dark mode)'],
            ['key' => 'skin_dark_gradient_start', 'value' => '#2e2957', 'description' => 'Gradient start color (dark mode)'],
            ['key' => 'skin_dark_gradient_end', 'value' => '#1c1c3b', 'description' => 'Gradient end color (dark mode)'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::firstOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
