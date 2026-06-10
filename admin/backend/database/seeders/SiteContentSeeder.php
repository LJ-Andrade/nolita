<?php

namespace Database\Seeders;

use App\Models\SiteContent;
use Illuminate\Database\Seeder;

class SiteContentSeeder extends Seeder
{
	public function run(): void
	{
		$contents = [
			['key' => 'home_top_text_retail', 'value' => 'Envios bonificados en compras minoristas seleccionadas', 'section' => 'home', 'type' => 'text', 'description' => 'Retail announcement bar text'],
			['key' => 'home_top_text_wholesale', 'value' => 'Envios bonificados en pedidos mayoristas · Nueva coleccion disponible', 'section' => 'home', 'type' => 'text', 'description' => 'Wholesale announcement bar text'],
			['key' => 'home_terms_and_conditions', 'value' => '', 'section' => 'home', 'type' => 'rich-text', 'description' => 'Terms and conditions page content'],
			['key' => 'business_phone', 'value' => '11 4343-4343', 'type' => 'text', 'description' => 'Public contact phone'],
			['key' => 'business_email', 'value' => 'info@nolita.com.ar', 'type' => 'text', 'description' => 'Public contact email'],
			['key' => 'business_address', 'value' => 'Riobamba 1080 - CABA', 'type' => 'text', 'description' => 'Public business address'],
			['key' => 'business_hours', 'value' => 'Lunes a Viernes 9 a 18hs', 'type' => 'text', 'description' => 'Public business hours'],
			['key' => 'business_whatsapp', 'value' => '11 4343-4343', 'type' => 'text', 'description' => 'Public WhatsApp number'],
			['key' => 'business_facebook', 'value' => 'https://www.facebook.com/nolita', 'type' => 'url', 'description' => 'Public Facebook URL'],
			['key' => 'business_instagram', 'value' => 'https://www.instagram.com/nolita', 'type' => 'url', 'description' => 'Public Instagram URL'],
			['key' => 'business_linkedin', 'value' => 'https://www.linkedin.com/company/nolita', 'type' => 'url', 'description' => 'Public LinkedIn URL'],
			['key' => 'business_youtube', 'value' => 'https://www.youtube.com/nolita', 'type' => 'url', 'description' => 'Public YouTube URL'],
			['key' => 'business_tiktok', 'value' => 'https://www.tiktok.com/@nolita', 'type' => 'url', 'description' => 'Public TikTok URL'],
		];

		foreach ($contents as $content) {
			SiteContent::updateOrCreate(
				['key' => $content['key']],
				[
					...$content,
					'section' => $content['section'] ?? SiteContent::BUSINESS_SECTION,
				]
			);
		}
	}
}
