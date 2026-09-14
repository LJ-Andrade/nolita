<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\User;
use App\Support\Exports\OrderDocumentData;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class OrderSnapshotTest extends TestCase
{
    use RefreshDatabase;

    public function test_snapshot_is_built_from_the_variant(): void
    {
        $variant = $this->createVariant();

        $this->assertSame([
            'product_code' => 'NOL-1',
            'sku' => 'NOL-1-NEGRO-M',
            'color' => 'Negro',
            'size' => 'M',
        ], OrderItem::snapshotFromVariant($variant));
    }

    public function test_order_document_ignores_later_catalog_and_customer_changes(): void
    {
        $variant = $this->createVariant();
        $customer = Customer::create(['name' => 'Ana Original', 'email' => 'ana@example.com', 'dni' => '12345678']);
        $order = Order::create([
            'customer_id' => $customer->id,
            'status' => 'completed',
            'total_amount' => 100,
            'currency' => 'ARS',
            'price_mode' => 'retail',
            'customer_data' => ['name' => 'Ana Original', 'email' => 'ana@example.com', 'dni' => '12345678', 'address' => 'Calle 1'],
        ]);
        $order->items()->create([
            'product_id' => $variant->product_id,
            'product_variant_id' => $variant->id,
            'product_name' => 'Remera',
            'quantity' => 2,
            'unit_price' => 50,
            'subtotal' => 100,
            'metadata' => OrderItem::snapshotFromVariant($variant),
        ]);

        // Live records change after the sale.
        DB::table('products')->where('id', $variant->product_id)->update(['name' => 'Renamed', 'code' => 'NEW', 'status' => 'draft']);
        DB::table('product_colors')->where('id', $variant->product_color_id)->update(['name' => 'Rojo']);
        $customer->update(['name' => 'Ana Cambiada', 'address' => 'Otra calle']);
        $variant->delete();

        $document = OrderDocumentData::make($order->fresh());
        $item = $document['items']->first();

        $this->assertSame('Remera', $item['product_name']);
        $this->assertSame('NOL-1', $item['product_code']);
        $this->assertSame('Negro / M', $item['variant']);
        $this->assertSame('NOL-1-NEGRO-M', $item['sku']);
        $this->assertSame(50.0, $item['unit_price']);
        $this->assertSame('Ana Original', $document['customer']['name']);
        $this->assertSame('Calle 1', $document['customer']['address']);
        $this->assertSame('12345678', $document['customer']['dni']);

        $serialized = $order->fresh('items')->items->first()->toArray();
        $this->assertSame('Negro / M', $serialized['variant_label']);
        $this->assertSame('NOL-1-NEGRO-M', $serialized['sku']);
    }

    public function test_backfill_fills_missing_snapshots_only_for_placed_orders(): void
    {
        $variant = $this->createVariant();
        $customer = Customer::create(['name' => 'Ana', 'email' => 'ana@example.com', 'dni' => '87654321']);

        $placed = Order::create([
            'customer_id' => $customer->id,
            'status' => 'completed',
            'total_amount' => 50,
            'currency' => 'ARS',
            'price_mode' => 'retail',
            'customer_data' => ['name' => 'Ana en checkout'],
        ]);
        $placedItem = $placed->items()->create([
            'product_variant_id' => $variant->id,
            'product_id' => $variant->product_id,
            'product_name' => 'Remera',
            'quantity' => 1,
            'unit_price' => 50,
            'subtotal' => 50,
            'metadata' => ['product_code' => 'OLD-CODE'],
        ]);

        $cart = Order::create(['customer_id' => $customer->id, 'status' => 'pending', 'total_amount' => 0, 'currency' => 'ARS', 'price_mode' => 'retail']);
        $cartItem = $cart->items()->create([
            'product_variant_id' => $variant->id,
            'product_id' => $variant->product_id,
            'product_name' => 'Remera',
            'quantity' => 1,
            'unit_price' => 50,
            'subtotal' => 50,
        ]);

        (require database_path('migrations/2026_09_14_000001_backfill_order_snapshots.php'))->up();

        $metadata = $placedItem->fresh()->metadata;
        $this->assertSame('OLD-CODE', $metadata['product_code']);
        $this->assertSame('NOL-1-NEGRO-M', $metadata['sku']);
        $this->assertSame('Negro', $metadata['color']);
        $this->assertSame('M', $metadata['size']);

        $customerData = $placed->fresh()->customer_data;
        $this->assertSame('Ana en checkout', $customerData['name']);
        $this->assertSame('87654321', $customerData['dni']);
        $this->assertSame('ana@example.com', $customerData['email']);

        $this->assertNull($cartItem->fresh()->metadata);
        $this->assertNull($cart->fresh()->customer_data);
    }

    private function createVariant(): ProductVariant
    {
        $user = User::factory()->create();
        $productId = DB::table('products')->insertGetId([
            'name' => 'Remera',
            'code' => 'NOL-1',
            'slug' => 'remera-'.uniqid(),
            'user_id' => $user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $colorId = DB::table('product_colors')->insertGetId(['name' => 'Negro', 'hex_color' => '#000000', 'created_at' => now(), 'updated_at' => now()]);
        $sizeId = DB::table('product_sizes')->insertGetId(['name' => 'M', 'created_at' => now(), 'updated_at' => now()]);

        return ProductVariant::query()->create([
            'product_id' => $productId,
            'product_color_id' => $colorId,
            'product_size_id' => $sizeId,
            'sku' => 'NOL-1-NEGRO-M',
            'stock' => 10,
            'active' => true,
        ])->load(['product', 'color', 'size']);
    }
}
