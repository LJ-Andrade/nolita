<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class BusinessSettingsSeeder extends Seeder
{
	public function run(): void
	{
		$settings = [
			['key' => 'business_phone', 'value' => '', 'description' => 'Teléfono de contacto'],
			['key' => 'business_email', 'value' => '', 'description' => 'Email de contacto'],
			['key' => 'business_address', 'value' => '', 'description' => 'Dirección del negocio'],
			['key' => 'business_hours', 'value' => '', 'description' => 'Horario de atención'],
			['key' => 'business_whatsapp', 'value' => '', 'description' => 'Número de WhatsApp'],
			['key' => 'business_facebook', 'value' => '', 'description' => 'URL de Facebook'],
			['key' => 'business_instagram', 'value' => '', 'description' => 'URL de Instagram'],
			['key' => 'business_linkedin', 'value' => '', 'description' => 'URL de LinkedIn'],
			['key' => 'business_youtube', 'value' => '', 'description' => 'URL de YouTube'],
			['key' => 'business_tiktok', 'value' => '', 'description' => 'URL de TikTok'],
			['key' => 'mail_to_address', 'value' => '', 'description' => 'Email destino para formulario de contacto'],
			['key' => 'business_name', 'value' => '', 'description' => 'Nombre del negocio mostrado en el sidebar'],
			['key' => 'language_default_mode', 'value' => 'light', 'description' => 'Modo de idioma por defecto (light/dark)'],
			['key' => 'language_toggle_enabled', 'value' => 'true', 'description' => 'Habilitar cambio de idioma'],

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
