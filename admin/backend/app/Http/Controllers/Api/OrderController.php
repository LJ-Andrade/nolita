<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Locality;
use App\Models\DeliveryMethod;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Coupon;
use App\Models\PaymentMethod;
use App\Models\ProductVariant;
use App\Models\ShopConfiguration;
use App\Models\NotificationType;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
	/**
	 * Get the current active cart for the authenticated customer.
	 */
	public function getCart(Request $request)
	{
		$cart = Order::where('customer_id', $request->user()->id)
			->where('status', 'pending')
			->with(['items.variant.product.colors', 'items.variant.product.media', 'items.variant.color', 'items.variant.size'])
			->latest()
			->first();

		if (!$cart) {
			return response()->json(['message' => 'No active cart found'], 404);
		}

		return response()->json($this->transformCart($cart));
	}

	/**
	 * Add an item to the cart. Creates a cart if it doesn't exist.
	 */
	public function addToCart(Request $request)
	{
		$request->validate([
			'product_variant_id' => 'required|exists:product_variants,id',
			'quantity' => 'required|integer|min:1',
			'price_mode' => ['nullable', Rule::in(['retail', 'wholesale'])],
		]);

		$variant = ProductVariant::with('product')->find($request->product_variant_id);
		$priceMode = $this->resolvePriceMode($request->input('price_mode'));
		$unitPrice = $this->getVariantUnitPrice($variant, $priceMode);

		if ($unitPrice <= 0) {
			return response()->json(['message' => 'Product is not available for this mode'], 422);
		}

		DB::beginTransaction();
		try {
			// Find or create cart
			$cart = Order::firstOrCreate(
				[
					'customer_id' => $request->user()->id,
					'status' => 'pending'
				],
				[
					'total_amount' => 0,
					'currency' => 'ARS',
					'price_mode' => $priceMode,
				]
			);
			$cart->update(['price_mode' => $priceMode]);

			// Find or create item
			/** @var \App\Models\OrderItem|null $item */
			$item = $cart->items()->where('product_variant_id', $variant->id)->first();

			if ($item) {
				// Update quantity
				$item->increment('quantity', $request->quantity);
				$item->update([
					'unit_price' => $unitPrice,
					'subtotal' => $item->quantity * $unitPrice
				]);
			} else {
				// Create item
				$cart->items()->create([
					'product_id' => $variant->product_id,
					'product_variant_id' => $variant->id,
					'product_name' => $variant->product->name,
					'quantity' => $request->quantity,
					'unit_price' => $unitPrice,
					'subtotal' => $unitPrice * $request->quantity,
				]);
			}

			$this->updateCartTotal($cart);

			DB::commit();

			return response()->json($this->transformCart($cart->fresh(['items.variant.product.colors', 'items.variant.product.media', 'items.variant.color', 'items.variant.size'])));
		} catch (\Exception $e) {
			DB::rollBack();
			return response()->json(['message' => 'Error adding to cart: ' . $e->getMessage()], 500);
		}
	}

	/**
	 * Update item quantity.
	 */
	public function updateItem(Request $request, $itemId)
	{
		$request->validate([
			'quantity' => 'required|integer|min:1',
			'price_mode' => ['nullable', Rule::in(['retail', 'wholesale'])],
		]);

		$item = OrderItem::with('variant.product')->findOrFail($itemId);
		$cart = $item->order;

		if ($cart->customer_id !== $request->user()->id || $cart->status !== 'pending') {
			return response()->json(['message' => 'Unauthorized'], 403);
		}

		DB::beginTransaction();
		try {
			$priceMode = $this->resolvePriceMode($request->input('price_mode', $cart->price_mode));
			$unitPrice = $this->getVariantUnitPrice($item->variant, $priceMode);
			if ($unitPrice <= 0) {
				return response()->json(['message' => 'Product is not available for this mode'], 422);
			}
			$item->update([
				'quantity' => $request->quantity,
				'unit_price' => $unitPrice,
				'subtotal' => $request->quantity * $unitPrice
			]);

			$this->updateCartTotal($cart);
			$cart->update(['price_mode' => $priceMode]);

			DB::commit();

			return response()->json($this->transformCart($cart->fresh(['items.variant.product.colors', 'items.variant.product.media', 'items.variant.color', 'items.variant.size'])));
		} catch (\Exception $e) {
			DB::rollBack();
			return response()->json(['message' => 'Error updating cart item'], 500);
		}
	}

	/**
	 * Remove item from cart.
	 */
	public function removeItem(Request $request, $itemId)
	{
		$item = OrderItem::with('variant')->findOrFail($itemId);
		$cart = $item->order;

		if ($cart->customer_id !== $request->user()->id || $cart->status !== 'pending') {
			return response()->json(['message' => 'Unauthorized'], 403);
		}

		DB::beginTransaction();
		try {
			$item->delete();

			// If empty, delete cart (as requested)
			if ($cart->items()->count() === 0) {
				$cart->delete();
				DB::commit();

				return response()->json([
					'id' => null,
					'checkoutUrl' => '',
					'cost' => [
						'subtotalAmount' => ['amount' => '0', 'currencyCode' => 'ARS'],
						'totalAmount' => ['amount' => '0', 'currencyCode' => 'ARS'],
						'totalTaxAmount' => ['amount' => '0', 'currencyCode' => 'ARS'],
					],
					'lines' => [],
					'totalQuantity' => 0
				], 200);
			}

			$this->updateCartTotal($cart);

			DB::commit();

			return response()->json($this->transformCart($cart->fresh(['items.variant.product.colors', 'items.variant.product.media', 'items.variant.color', 'items.variant.size'])));
		} catch (\Exception $e) {
			DB::rollBack();
			return response()->json(['message' => 'Error removing cart item'], 500);
		}
	}

	/**
	 * Finalize the order (Checkout).
	 */
	public function checkout(Request $request)
	{
		$validated = $request->validate([
			'name' => ['required', 'string', 'max:255'],
			'email' => ['required', 'email', 'max:255'],
			'phone' => ['required', 'string', 'max:50'],
			'whatsapp' => ['required', 'string', 'max:50'],
			'cuit' => ['required', 'string', 'max:50'],
			'address' => ['required', 'string', 'max:1000'],
			'city' => ['nullable', 'string', 'max:255'],
			'postal_code' => ['required', 'string', 'max:20'],
			'price_mode' => ['nullable', Rule::in(['retail', 'wholesale'])],
			'lines' => ['nullable', 'array'],
			'lines.*.merchandiseId' => ['required_with:lines', 'integer', 'exists:product_variants,id'],
			'lines.*.quantity' => ['required_with:lines', 'integer', 'min:1'],
			'province_id' => ['required', 'integer', 'exists:provinces,id'],
			'locality_id' => [
				'required',
				'integer',
				Rule::exists('localities', 'id')->where('province_id', $request->input('province_id')),
			],
			'delivery_method_id' => ['required', 'integer', 'exists:delivery_methods,id'],
			'payment_method_id' => [
				'required',
				'integer',
				Rule::exists('payment_methods', 'id')->where('status', 'active'),
			],
			'coupon_code' => ['nullable', 'string', 'max:255'],
		]);

		$locality = Locality::findOrFail($validated['locality_id']);
		$deliveryMethod = DeliveryMethod::findOrFail($validated['delivery_method_id']);
		$paymentMethod = PaymentMethod::where('status', 'active')->findOrFail($validated['payment_method_id']);
		$city = $validated['city'] ?: $locality->name;
		$priceMode = $this->resolvePriceMode($validated['price_mode'] ?? null);
		$customer = auth('customer')->user() ?: $request->user();

		$cart = $customer
			? Order::where('customer_id', $customer->id)
				->where('status', 'pending')
				->with('items.variant.product')
				->first()
			: null;

		if (!$cart && empty($validated['lines'])) {
			return response()->json(['message' => 'No active cart found'], 404);
		}

		if ($cart && $cart->items()->count() === 0) {
			return response()->json(['message' => 'Cannot checkout an empty cart'], 400);
		}

		$deliveryFee = (float) $deliveryMethod->fee;
		$paymentFee = (float) $paymentMethod->fee;
		$checkoutLines = $cart
			? $cart->items->map(fn (OrderItem $item): array => [
				'variant_id' => (int) $item->product_variant_id,
				'quantity' => (int) $item->quantity,
			])->values()->all()
			: collect($validated['lines'])->map(fn (array $line): array => [
				'variant_id' => (int) $line['merchandiseId'],
				'quantity' => (int) $line['quantity'],
			])->values()->all();

		$pricedLines = $this->buildPricedCheckoutLines($checkoutLines, $priceMode);
		if (empty($pricedLines)) {
			return response()->json(['message' => 'Cannot checkout an empty cart'], 400);
		}

		$subtotal = collect($pricedLines)->sum('subtotal');
		$minimumError = $this->validateWholesaleMinimums($priceMode, $pricedLines, $subtotal);
		if ($minimumError) {
			return response()->json(['message' => $minimumError], 422);
		}

		$couponCode = trim((string) ($validated['coupon_code'] ?? ''));
		$couponDiscountAmount = 0;
		$appliedCouponCode = null;

		if ($couponCode !== '') {
			$coupon = Coupon::whereRaw('LOWER(code) = ?', [strtolower($couponCode)])->first();

			if (!$coupon || !$coupon->isValidForCheckout()) {
				return response()->json(['message' => 'Cupon invalido o vencido'], 422);
			}

			$couponDiscountAmount = $coupon->discountForSubtotal($subtotal);
			$appliedCouponCode = $coupon->code;
		}

		try {
			$completedOrder = DB::transaction(function () use (
			$cart,
			$customer,
			$validated,
			$locality,
			$deliveryMethod,
			$paymentMethod,
			$city,
			$priceMode,
			$pricedLines,
			$subtotal,
			$deliveryFee,
			$paymentFee,
			$couponDiscountAmount,
			$appliedCouponCode
		) {
			$order = $cart ?: Order::create([
				'customer_id' => $customer?->id,
				'status' => 'pending',
				'total_amount' => 0,
				'currency' => 'ARS',
				'price_mode' => $priceMode,
			]);

			if (!$cart) {
				foreach ($pricedLines as $line) {
					$variant = $line['variant'];
					$order->items()->create([
						'product_id' => $variant->product_id,
						'product_variant_id' => $variant->id,
						'product_name' => $variant->product->name,
						'quantity' => $line['quantity'],
						'unit_price' => $line['unit_price'],
						'subtotal' => $line['subtotal'],
					]);
				}
			} else {
				foreach ($order->items as $item) {
					$line = collect($pricedLines)->firstWhere('variant_id', (int) $item->product_variant_id);
					$item->update([
						'unit_price' => $line['unit_price'],
						'subtotal' => $line['subtotal'],
					]);
				}
			}

			foreach ($pricedLines as $line) {
				$variant = ProductVariant::whereKey($line['variant_id'])->lockForUpdate()->firstOrFail();
				if ($variant->stock < $line['quantity']) {
					throw new \RuntimeException("No hay stock suficiente para {$line['product_name']}");
				}
				$variant->decrement('stock', $line['quantity']);
			}

			$customerData = [
				'name' => $validated['name'],
				'email' => $validated['email'],
				'phone' => $validated['phone'],
				'whatsapp' => $validated['whatsapp'],
				'cuit' => $validated['cuit'],
				'address' => $validated['address'],
				'city' => $city,
				'postal_code' => $validated['postal_code'],
				'province_id' => $validated['province_id'],
				'province' => $locality->province?->name,
				'locality_id' => $validated['locality_id'],
				'locality' => $locality->name,
			];

			$order->update([
				'status' => 'completed',
				'total_amount' => max($subtotal - $couponDiscountAmount, 0) + $deliveryFee + $paymentFee,
				'price_mode' => $priceMode,
				'payment_method' => (string) $validated['payment_method_id'],
				'coupon_code' => $appliedCouponCode,
				'coupon_discount_amount' => $couponDiscountAmount,
				'customer_data' => $customerData,
				'shipping_address' => [
					'name' => $validated['name'],
					'email' => $validated['email'],
					'phone' => $validated['phone'],
					'whatsapp' => $validated['whatsapp'],
					'cuit' => $validated['cuit'],
					'address' => $validated['address'],
					'city' => $city,
					'postal_code' => $validated['postal_code'],
					'province_id' => $validated['province_id'],
					'province' => $locality->province?->name,
					'locality_id' => $validated['locality_id'],
					'locality' => $locality->name,
					'delivery_method_id' => (string) $validated['delivery_method_id'],
					'delivery_method_name' => $deliveryMethod->name,
					'delivery_fee' => $deliveryFee,
				],
				'billing_address' => [
					'name' => $validated['name'],
					'email' => $validated['email'],
					'phone' => $validated['phone'],
					'whatsapp' => $validated['whatsapp'],
					'cuit' => $validated['cuit'],
					'address' => $validated['address'],
					'city' => $city,
					'postal_code' => $validated['postal_code'],
					'province_id' => $validated['province_id'],
					'province' => $locality->province?->name,
					'locality_id' => $validated['locality_id'],
					'locality' => $locality->name,
					'payment_method_id' => (string) $validated['payment_method_id'],
					'payment_method_name' => $paymentMethod->name,
					'payment_fee' => $paymentFee,
				],
			]);

			if ($customer) {
				$customer->update([
				'name' => $validated['name'],
				'email' => $validated['email'],
				'phone' => $validated['phone'],
				'address' => $validated['address'],
				'postal_code' => $validated['postal_code'],
				'province_id' => $validated['province_id'],
				'locality_id' => $validated['locality_id'],
				]);
			}
				return $order->fresh(['items']);
			});
		} catch (\RuntimeException $exception) {
			return response()->json(['message' => $exception->getMessage()], 422);
		}

		$this->notifyOrderCreated($completedOrder);

		return response()->json([
			'message' => 'Order completed successfully',
			'order' => $completedOrder
		]);
	}

	/**
	 * List all orders (excluding active cart).
	 */
	public function index(Request $request)
	{
		// Maybe we want orders with stats other than 'pending' (cart)
		// Or all orders. Usually in e-commerce 'pending' means 'pending payment'.
		// This logic will depend on how we finalize the cart.
		$orders = Order::where('customer_id', $request->user()->id)
			->with('items')
			->latest()
			->get();

		return response()->json($orders);
	}

	private function updateCartTotal(Order $cart)
	{
		$cart->update([
			'total_amount' => $cart->items()->sum('subtotal')
		]);
	}

	private function buildPricedCheckoutLines(array $lines, string $priceMode): array
	{
		$groupedLines = collect($lines)
			->groupBy('variant_id')
			->map(fn ($items, $variantId): array => [
				'variant_id' => (int) $variantId,
				'quantity' => collect($items)->sum('quantity'),
			])
			->values();

		$variants = ProductVariant::with('product')
			->whereIn('id', $groupedLines->pluck('variant_id'))
			->get()
			->keyBy('id');

		return $groupedLines->map(function (array $line) use ($variants, $priceMode) {
			$variant = $variants->get($line['variant_id']);
			$unitPrice = $this->getVariantUnitPrice($variant, $priceMode);

			if (!$variant || !$variant->product || $unitPrice <= 0) {
				return null;
			}

			return [
				'variant_id' => (int) $variant->id,
				'variant' => $variant,
				'product_name' => $variant->product->name,
				'quantity' => (int) $line['quantity'],
				'unit_price' => $unitPrice,
				'subtotal' => round($unitPrice * (int) $line['quantity'], 2),
			];
		})->filter()->values()->all();
	}

	private function validateWholesaleMinimums(string $priceMode, array $pricedLines, float $subtotal): ?string
	{
		if ($priceMode !== 'wholesale') {
			return null;
		}

		$config = ShopConfiguration::getConfig();
		$totalQuantity = collect($pricedLines)->sum('quantity');

		if ($config->min_quantity > 0 && $totalQuantity < $config->min_quantity) {
			return "La compra mayorista requiere minimo {$config->min_quantity} prendas.";
		}

		if ((float) $config->min_amount > 0 && $subtotal < (float) $config->min_amount) {
			return 'La compra mayorista no alcanza el monto minimo.';
		}

		return null;
	}

	private function getVariantUnitPrice(?ProductVariant $variant, string $priceMode = 'retail'): float
	{
		if (!$variant || !$variant->product) {
			return 0.0;
		}

		if ($priceMode === 'wholesale') {
			return round((float) ($variant->product->wholesale_price ?? 0), 2);
		}

		$originalPrice = round((float) $variant->product->sale_price, 2);
		$discount = max(min((float) ($variant->product->discount ?? 0), 100), 0);

		if ($discount <= 0) {
			return $originalPrice;
		}

		return round($originalPrice * (1 - ($discount / 100)), 2);
	}

	private function getVariantCompareAtPrice(?ProductVariant $variant, string $priceMode = 'retail'): ?float
	{
		if (!$variant || !$variant->product) {
			return null;
		}

		if ($priceMode === 'wholesale') {
			return null;
		}

		$originalPrice = round((float) $variant->product->sale_price, 2);
		$unitPrice = $this->getVariantUnitPrice($variant, $priceMode);

		return $unitPrice < $originalPrice ? $originalPrice : null;
	}

	private function getVariantDiscountPercent(?ProductVariant $variant): float
	{
		if (!$variant || !$variant->product) {
			return 0.0;
		}

		return max(min((float) ($variant->product->discount ?? 0), 100), 0);
	}

	private function resolvePriceMode(?string $mode): string
	{
		return $mode === 'wholesale' ? 'wholesale' : 'retail';
	}

	private function notifyOrderCreated(Order $order): void
	{
		$type = NotificationType::where('key', 'order.created')->first();
		if (!$type) {
			return;
		}

		app(NotificationService::class)->sendToSubscribers(
			$type,
			'Nuevo pedido recibido',
			'Se registro un nuevo pedido desde la tienda web.',
			[
				'order_id' => $order->id,
				'price_mode' => $order->price_mode,
				'is_guest' => $order->customer_id === null,
				'total_amount' => $order->total_amount,
			]
		);
	}

	private function transformCart(Order $cart)
	{
		// Re-use logic for Next.js Commerce Cart interface
		return [
			'id' => (string) $cart->id,
			'checkoutUrl' => '/checkout/' . $cart->id, // Placeholder
			'priceMode' => $cart->price_mode ?? 'retail',
			'cost' => [
				'subtotalAmount' => [
					'amount' => (string) $cart->total_amount,
					'currencyCode' => $cart->currency,
				],
				'totalAmount' => [
					'amount' => (string) $cart->total_amount,
					'currencyCode' => $cart->currency,
				],
				'totalTaxAmount' => [
					'amount' => "0.00",
					'currencyCode' => $cart->currency,
				],
			],
			'lines' => $cart->items->map(function ($item) {
				if (!$item->variant || !$item->variant->product) {
					return null;
				}
				$priceMode = $item->order->price_mode ?? 'retail';
				$compareAtPrice = $this->getVariantCompareAtPrice($item->variant, $priceMode);
				$discount = $priceMode === 'retail' ? $this->getVariantDiscountPercent($item->variant) : 0;
				$hasDiscount = $compareAtPrice !== null && $discount > 0;
				return [
					'id' => (string) $item->id,
					'quantity' => $item->quantity,
					'cost' => [
						'totalAmount' => [
							'amount' => (string) $item->subtotal,
							'currencyCode' => $item->order->currency,
						],
						'compareAtTotalAmount' => $hasDiscount ? [
							'amount' => (string) ($compareAtPrice * (int) $item->quantity),
							'currencyCode' => $item->order->currency,
						] : null,
					],
					'discount' => $discount,
					'hasDiscount' => $hasDiscount,
					'merchandise' => [
						'id' => (string) $item->product_variant_id,
						'title' => $item->product_name,
						'selectedOptions' => $this->getVariantOptions($item->variant),
						'product' => [
							'id' => (string) $item->product_id,
							'handle' => $item->variant->product->slug,
							'title' => $item->variant->product->name,
							'stock' => $item->variant->stock,
							'featuredImage' => [
								'url' => $item->variant->product->getFirstMediaUrl('cover'),
								'altText' => $item->variant->product->name,
							],
							'colorImages' => $item->variant->product->getMedia('color_images')->map(function ($media) use ($item) {
								$color = $item->variant->product->colors->firstWhere('id', $media->getCustomProperty('color_id'));
								if (!$color)
									return null;
								return [
									'color' => $color->name,
									'url' => $media->getFullUrl(),
								];
							})->filter()->values()->toArray(),
						],
					],
				];
			})->filter()->values(),
			'totalQuantity' => $cart->items->filter(fn($item) => $item->variant && $item->variant->product)->sum('quantity'),
		];
	}

	private function getVariantOptions($variant)
	{
		$options = [];
		if (!$variant)
			return $options;

		if ($variant->color) {
			$options[] = ['name' => 'Color', 'value' => $variant->color->name];
		}
		if ($variant->size) {
			$options[] = ['name' => 'Talle', 'value' => $variant->size->name];
		}
		return $options;
	}
}
