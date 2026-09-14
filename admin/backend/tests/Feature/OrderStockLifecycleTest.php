<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\OrderStockService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class OrderStockLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private OrderStockService $stock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->stock = app(OrderStockService::class);
    }

    public function test_cancelling_a_checked_out_order_returns_stock_once(): void
    {
        $variant = $this->createVariant(stock: 3);
        $order = $this->createOrder($variant, quantity: 2, status: 'pending', deducted: true);

        $result = $this->stock->transitionStatus($order, 'cancelled');

        $this->assertSame('restored', $result['stock_action']);
        $this->assertSame(5, $variant->fresh()->stock);
        $this->assertNull($order->fresh()->stock_deducted_at);

        // Re-sending the same status must not return stock again.
        $this->stock->transitionStatus($order->fresh(), 'cancelled');
        $this->assertSame(5, $variant->fresh()->stock);
    }

    public function test_cancelling_an_order_without_deducted_stock_does_not_move_stock(): void
    {
        $variant = $this->createVariant(stock: 3);
        $order = $this->createOrder($variant, quantity: 2, status: 'pending', deducted: false);

        $result = $this->stock->transitionStatus($order, 'cancelled');

        $this->assertNull($result['stock_action']);
        $this->assertSame(3, $variant->fresh()->stock);
        $this->assertSame('cancelled', $order->fresh()->status);
    }

    public function test_reactivating_a_cancelled_order_deducts_stock_again(): void
    {
        $variant = $this->createVariant(stock: 5);
        $order = $this->createOrder($variant, quantity: 2, status: 'cancelled', deducted: false);

        $result = $this->stock->transitionStatus($order, 'processing');

        $this->assertSame('deducted', $result['stock_action']);
        $this->assertSame(3, $variant->fresh()->stock);
        $this->assertNotNull($order->fresh()->stock_deducted_at);
    }

    public function test_reactivation_without_enough_stock_fails_and_keeps_status(): void
    {
        $variant = $this->createVariant(stock: 1);
        $order = $this->createOrder($variant, quantity: 2, status: 'cancelled', deducted: false);

        try {
            $this->stock->transitionStatus($order, 'pending');
            $this->fail('Expected a stock validation error.');
        } catch (ValidationException) {
            // expected
        }

        $this->assertSame(1, $variant->fresh()->stock);
        $this->assertSame('cancelled', $order->fresh()->status);
        $this->assertNull($order->fresh()->stock_deducted_at);
    }

    public function test_completing_an_order_without_deducted_stock_deducts_it(): void
    {
        $variant = $this->createVariant(stock: 4);
        $order = $this->createOrder($variant, quantity: 3, status: 'pending', deducted: false);

        $this->stock->transitionStatus($order, 'completed');

        $this->assertSame(1, $variant->fresh()->stock);
    }

    public function test_status_changes_between_active_states_do_not_move_stock(): void
    {
        $variant = $this->createVariant(stock: 4);
        $deducted = $this->createOrder($variant, quantity: 1, status: 'pending', deducted: true);
        $notDeducted = $this->createOrder($variant, quantity: 1, status: 'pending', deducted: false);

        $this->stock->transitionStatus($deducted, 'completed');
        $this->stock->transitionStatus($notDeducted, 'processing');

        $this->assertSame(4, $variant->fresh()->stock);
    }

    public function test_deleting_orders_returns_stock_except_for_completed_ones(): void
    {
        $variant = $this->createVariant(stock: 10);
        $pending = $this->createOrder($variant, quantity: 2, status: 'pending', deducted: true);
        $completed = $this->createOrder($variant, quantity: 3, status: 'completed', deducted: true);
        $cancelled = $this->createOrder($variant, quantity: 4, status: 'cancelled', deducted: false);

        $deleted = $this->stock->deleteOrders([$pending->id, $completed->id, $cancelled->id]);

        $this->assertCount(3, $deleted);
        $this->assertSame(12, $variant->fresh()->stock);
        $this->assertSame(0, Order::count());
    }

    public function test_restore_skips_items_whose_variant_was_deleted(): void
    {
        $variant = $this->createVariant(stock: 2);
        $order = $this->createOrder($variant, quantity: 2, status: 'pending', deducted: true);
        $order->items()->create(['product_variant_id' => null, 'product_name' => 'Deleted', 'quantity' => 1, 'unit_price' => 1, 'subtotal' => 1]);

        $this->stock->transitionStatus($order, 'cancelled');

        $this->assertSame(4, $variant->fresh()->stock);
    }

    public function test_active_cart_scope_ignores_checked_out_pending_orders(): void
    {
        $variant = $this->createVariant(stock: 5);
        $placed = $this->createOrder($variant, quantity: 1, status: 'pending', deducted: true);
        $cart = Order::create(['status' => 'pending', 'total_amount' => 0, 'currency' => 'ARS', 'price_mode' => 'retail']);

        $this->assertSame([$cart->id], Order::activeCart()->pluck('id')->all());
        $this->assertNotContains($placed->id, Order::activeCart()->pluck('id')->all());
    }

    private function createVariant(int $stock): ProductVariant
    {
        $user = User::factory()->create();
        $productId = DB::table('products')->insertGetId([
            'name' => 'Test product',
            'slug' => 'test-product-'.uniqid(),
            'user_id' => $user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return ProductVariant::query()->create([
            'product_id' => $productId,
            'sku' => 'SKU-'.uniqid(),
            'stock' => $stock,
            'active' => true,
        ]);
    }

    private function createOrder(ProductVariant $variant, int $quantity, string $status, bool $deducted): Order
    {
        $order = Order::create([
            'status' => $status,
            'total_amount' => 100,
            'currency' => 'ARS',
            'price_mode' => 'retail',
            'customer_data' => ['name' => 'Test', 'email' => 'test@example.com'],
            'stock_deducted_at' => $deducted ? now() : null,
        ]);

        $order->items()->create([
            'product_id' => $variant->product_id,
            'product_variant_id' => $variant->id,
            'product_name' => 'Test product',
            'quantity' => $quantity,
            'unit_price' => 50,
            'subtotal' => 50 * $quantity,
        ]);

        return $order;
    }
}
