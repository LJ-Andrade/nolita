<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\GuestCustomer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class OrderSeeder extends Seeder
{
    private const DEMO_NOTE = 'Demo statistics order';
    private const DEMO_GUEST_NOTE = 'Demo anonymous order';

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

        Order::query()->whereIn('notes', [self::DEMO_NOTE, self::DEMO_GUEST_NOTE])->delete();
        GuestCustomer::query()
            ->whereIn('email', collect($this->guestProfiles())->pluck('email')->all())
            ->delete();

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

        $this->seedGuestOrders($products);
    }

    private function seedGuestOrders($products): void
    {
        foreach ($this->guestProfiles() as $index => $profile) {
            $priceMode = $profile['price_mode'];
            $selectedProducts = $products->slice(($index + 2) % $products->count())->take(2);

            if ($selectedProducts->count() < 2) {
                $selectedProducts = $products->take(min(2, $products->count()));
            }

            $items = [];
            $total = 0;

            foreach ($selectedProducts->values() as $productIndex => $product) {
                $variant = $product->variants->first();
                $quantity = 1 + (($index + $productIndex) % 2);
                $unitPrice = $this->getUnitPrice($product, $priceMode);
                $subtotal = round($unitPrice * $quantity, 2);
                $total += $subtotal;
                $items[] = compact('product', 'variant', 'quantity', 'unitPrice', 'subtotal');
            }

            $orderAt = Carbon::now()->subDays(3 - $index);
            $guest = GuestCustomer::upsertFromCheckout($profile['customer_data'], $priceMode, round($total, 2), $orderAt);

            $order = Order::create([
                'customer_id' => null,
                'guest_customer_id' => $guest?->id,
                'status' => $profile['status'],
                'payment_status' => $profile['status'] === 'completed' ? 'paid' : 'unpaid',
                'total_amount' => round($total, 2),
                'currency' => 'ARS',
                'price_mode' => $priceMode,
                'payment_method' => $profile['payment_method'],
                'customer_data' => $profile['customer_data'],
                'shipping_address' => [
                    'name' => $profile['customer_data']['name'],
                    'email' => $profile['customer_data']['email'],
                    'phone' => $profile['customer_data']['phone'],
                    'address' => $profile['customer_data']['address'],
                    'postal_code' => $profile['customer_data']['postal_code'],
                ],
                'billing_address' => [
                    'name' => $profile['customer_data']['name'],
                    'email' => $profile['customer_data']['email'],
                    'cuit' => $profile['customer_data']['cuit'] ?? null,
                ],
                'notes' => self::DEMO_GUEST_NOTE,
                'created_at' => $orderAt,
                'updated_at' => $orderAt,
            ]);

            foreach ($items as $item) {
                $order->items()->create([
                    'product_id' => $item['product']->id,
                    'product_variant_id' => $item['variant']?->id,
                    'product_name' => $item['product']->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unitPrice'],
                    'subtotal' => $item['subtotal'],
                    'metadata' => [
                        'demo' => true,
                        'anonymous' => true,
                        'variant_sku' => $item['variant']?->sku,
                    ],
                ]);
            }
        }
    }

    private function getUnitPrice(Product $product, string $priceMode = 'retail'): float
    {
        $price = $priceMode === 'wholesale'
            ? (float) ($product->wholesale_price ?: $product->sale_price)
            : (float) $product->sale_price;
        $discount = $priceMode === 'wholesale'
            ? max(min((float) ($product->wholesale_discount ?? 0), 100), 0)
            : max(min((float) ($product->discount ?? 0), 100), 0);

        if ($discount <= 0) {
            return round($price, 2);
        }

        return round($price * (1 - ($discount / 100)), 2);
    }

    private function guestProfiles(): array
    {
        return [
            [
                'status' => 'completed',
                'price_mode' => 'retail',
                'payment_method' => 'transfer',
                'customer_data' => [
                    'name' => 'Lucia Invitada',
                    'email' => 'lucia.invitada@example.com',
                    'phone' => '+54 11 5555-0101',
                    'whatsapp' => '+54 9 11 5555-0101',
                    'cuit' => null,
                    'address' => 'Av. Santa Fe 1234',
                    'city' => 'CABA',
                    'postal_code' => '1060',
                    'province_id' => null,
                    'locality_id' => null,
                ],
            ],
            [
                'status' => 'completed',
                'price_mode' => 'wholesale',
                'payment_method' => 'cash',
                'customer_data' => [
                    'name' => 'Showroom Norte',
                    'email' => 'compras.showroom@example.com',
                    'phone' => '+54 11 5555-0202',
                    'whatsapp' => '+54 9 11 5555-0202',
                    'cuit' => '30-71234567-8',
                    'address' => 'Ruta 8 Km 42',
                    'city' => 'Pilar',
                    'postal_code' => '1629',
                    'province_id' => null,
                    'locality_id' => null,
                ],
            ],
        ];
    }
}
