<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ProductionLogFixesTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_api_request_without_json_accept_header_returns_401(): void
    {
        $this->get('/api/user')
            ->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_reset_password_link_points_to_the_vadmin_panel(): void
    {
        config(['app.admin_frontend_url' => 'https://nolita.com.ar/vadmin']);

        $user = User::factory()->make(['email' => 'admin+test@example.com']);
        $mail = (new ResetPasswordNotification('abc123'))->toMail($user);

        $this->assertSame(
            'https://nolita.com.ar/vadmin/reset-password?token=abc123&email=admin%2Btest%40example.com',
            $mail->actionUrl,
        );
    }

    public function test_cloudflare_purge_retries_transient_failures(): void
    {
        config([
            'app.revalidate_webhook_url' => null,
            'services.cloudflare.zone_id' => 'zone',
            'services.cloudflare.api_token' => 'token',
            'services.cloudflare.purge_everything' => true,
        ]);

        Http::fake([
            'api.cloudflare.com/*' => Http::sequence()
                ->push([], 503)
                ->push(['success' => true], 200),
        ]);
        Http::preventStrayRequests();

        app(\App\Services\StorefrontRevalidationService::class)->revalidate(['products']);

        Http::assertSentCount(2);
    }
}
