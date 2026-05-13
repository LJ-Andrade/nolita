<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    private const DEMO_NOTE = 'Demo statistics order';

    public function run(): void
    {
        $customers = Customer::query()->orderBy('id')->take(10)->get();
        $products = Product::query()
            ->with(['variants' => fn ($query) => $query->where('active', true)])
            ->orderBy('id')
            ->get();

        if ($customers->isEmpty() || $products->isEmpty()) {
            $this->command?->warn('Customers or products missing. Skipping order seeding.');
            return;
        }

        Order::query()->where('notes', self::DEMO_NOTE)->delete();

        $statuses = [
            'completed',
            'completed',
            'completed',
            'completed',
            'completed',
            'processing',
            'pending',
            'cancelled',
        ];

        foreach ($statuses as $index => $status) {
            $customer = $customers[$index % $customers->count()];
            $selectedProducts = $products->slice($index % $products->count())->take(2);

            if ($selectedProducts->count() < 2) {
                $selectedProducts = $products->take(min(2, $products->count()));
            }

            $order = Order::create([
                'customer_id' => $customer->id,
                'status' => $status,
                'total_amount' => 0,
                'currency' => 'ARS',
                'payment_method' => $index % 2 === 0 ? 'transfer' : 'cash',
                'shipping_address' => [
                    'address' => $customer->address,
                    'postal_code' => $customer->postal_code,
                ],
                'billing_address' => [
                    'name' => $customer->name,
                    'email' => $customer->email,
                ],
                'notes' => self::DEMO_NOTE,
            ]);

            $total = 0;

            foreach ($selectedProducts->values() as $productIndex => $product) {
                $variant = $product->variants->first();
                $quantity = 1 + (($index + $productIndex) % 3);
                $unitPrice = $this->getUnitPrice($product);
                $subtotal = round($unitPrice * $quantity, 2);
                $total += $subtotal;

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                    'metadata' => [
                        'demo' => true,
                        'variant_sku' => $variant?->sku,
                    ],
                ]);
            }

            $order->update(['total_amount' => round($total, 2)]);
        }
    }

    private function getUnitPrice(Product $product): float
    {
        $price = (float) $product->sale_price;
        $discount = max(min((float) ($product->discount ?? 0), 100), 0);

        if ($discount <= 0) {
            return round($price, 2);
        }

        return round($price * (1 - ($discount / 100)), 2);
    }
}
