<?php

namespace Database\Seeders;

use App\Models\SiteContent;
use Illuminate\Database\Seeder;

class SiteContentSeeder extends Seeder
{
	public function run(): void
	{
		$contents = [
			['key' => 'business_phone', 'value' => '11 4343-4343', 'type' => 'text', 'description' => 'Public contact phone'],
			['key' => 'business_email', 'value' => 'info@planb.com.ar', 'type' => 'text', 'description' => 'Public contact email'],
			['key' => 'business_address', 'value' => 'Riobamba 1080 - CABA', 'type' => 'text', 'description' => 'Public business address'],
			['key' => 'business_hours', 'value' => 'Lunes a Viernes 9 a 18hs', 'type' => 'text', 'description' => 'Public business hours'],
			['key' => 'business_whatsapp', 'value' => '11 4343-4343', 'type' => 'text', 'description' => 'Public WhatsApp number'],
			['key' => 'business_facebook', 'value' => 'https://www.facebook.com/planb', 'type' => 'url', 'description' => 'Public Facebook URL'],
			['key' => 'business_instagram', 'value' => 'https://www.instagram.com/planb', 'type' => 'url', 'description' => 'Public Instagram URL'],
			['key' => 'business_linkedin', 'value' => 'https://www.linkedin.com/planb', 'type' => 'url', 'description' => 'Public LinkedIn URL'],
			['key' => 'business_youtube', 'value' => 'https://www.youtube.com/planb', 'type' => 'url', 'description' => 'Public YouTube URL'],
			['key' => 'business_tiktok', 'value' => 'https://www.tiktok.com/planb', 'type' => 'url', 'description' => 'Public TikTok URL'],
		];

		foreach ($contents as $content) {
			SiteContent::updateOrCreate(
				['key' => $content['key']],
				[
					...$content,
					'section' => SiteContent::BUSINESS_SECTION,
				]
			);
		}
	}
}
