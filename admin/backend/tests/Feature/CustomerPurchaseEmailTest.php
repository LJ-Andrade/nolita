<?php

namespace Tests\Feature;

use App\Mail\OrderPurchased;
use App\Models\Order;
use App\Services\CustomerMailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class CustomerPurchaseEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_purchase_email_is_queued_to_the_order_snapshot_email(): void
    {
        Mail::fake();
        config(['customer_mail.test_recipient' => null]);

        $order = $this->createOrder();

        $this->assertTrue(app(CustomerMailService::class)->queueOrderPurchased($order));

        Mail::assertQueued(OrderPurchased::class, fn (OrderPurchased $mail): bool => $mail->hasTo('ana@example.com')
            && $mail->data['order_number'] === (string) $order->id
            && $mail->data['first_name'] === 'Ana');
    }

    public function test_non_production_emails_are_redirected_to_the_test_recipient(): void
    {
        Mail::fake();
        config(['customer_mail.test_recipient' => 'qa@example.com']);

        app(CustomerMailService::class)->queueOrderPurchased($this->createOrder());

        Mail::assertQueued(OrderPurchased::class, fn (OrderPurchased $mail): bool => $mail->hasTo('qa@example.com')
            && ! $mail->hasTo('ana@example.com'));
    }

    public function test_order_without_valid_email_is_skipped_without_failing(): void
    {
        Mail::fake();

        $order = $this->createOrder(['name' => 'Ana', 'email' => 'not-an-email']);

        $this->assertFalse(app(CustomerMailService::class)->queueOrderPurchased($order));
        Mail::assertNothingQueued();
    }

    public function test_rendered_email_contains_thanks_items_totals_and_sanitized_payment_description(): void
    {
        $order = $this->createOrder();
        $mail = new OrderPurchased(app(CustomerMailService::class)->orderPurchasedData($order));

        $html = $mail->render();

        $this->assertSame('Gracias por comprar en Nolita', $mail->envelope()->subject);
        $this->assertStringContainsString('Gracias por comprar en Nolita', $html);
        $this->assertStringContainsString('https://nolita.com.ar/logo-black.png', $html);
        $this->assertStringContainsString('Remera Básica', $html);
        $this->assertStringContainsString('Negro / M', $html);
        $this->assertStringContainsString('$ 21.000,00', $html);
        $this->assertStringContainsString('Transferencia', $html);
        $this->assertStringContainsString('<strong>Alias:</strong> nolita.ropa', $html);
        $this->assertStringNotContainsString('<script', $html);
        $this->assertStringNotContainsString('onclick', $html);

        $text = view('emails.customer.text.order-purchased', ['data' => $mail->data])->render();
        $this->assertStringContainsString('Alias: nolita.ropa', $text);
        $this->assertStringContainsString('Remera Básica (Negro / M): 2 x $ 10.000,00 = $ 20.000,00', $text);
    }

    private function createOrder(?array $customerData = null): Order
    {
        $order = Order::create([
            'status' => 'pending',
            'total_amount' => 21000,
            'currency' => 'ARS',
            'price_mode' => 'retail',
            'customer_data' => $customerData ?? [
                'name' => 'Ana Pérez',
                'email' => 'ana@example.com',
                'phone' => '1122334455',
                'address' => 'Calle 123',
                'locality' => 'Palermo',
                'province' => 'CABA',
                'postal_code' => '1414',
            ],
            'shipping_address' => [
                'delivery_method_name' => 'Envío a domicilio',
                'delivery_fee' => 1000,
            ],
            'billing_address' => [
                'payment_method_name' => 'Transferencia',
                'payment_method_description' => '<p onclick="x()"><strong>Alias:</strong> nolita.ropa</p><script>alert(1)</script>',
                'payment_fee' => 0,
            ],
        ]);

        $order->items()->create([
            'product_name' => 'Remera Básica',
            'quantity' => 2,
            'unit_price' => 10000,
            'subtotal' => 20000,
            'metadata' => ['product_code' => 'NOL-1', 'color' => 'Negro', 'size' => 'M'],
        ]);

        return $order;
    }
}
