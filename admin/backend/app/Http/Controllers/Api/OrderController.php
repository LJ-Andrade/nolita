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
		]);

		$variant = ProductVariant::with('product')->find($request->product_variant_id);
		$unitPrice = $this->getVariantUnitPrice($variant);

		// Stock check
		if ($variant->stock < $request->quantity) {
			return response()->json(['message' => 'Insufficient stock'], 400);
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
				]
			);

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

			// Reserve stock (as requested: "reservando stock real")
			$variant->decrement('stock', $request->quantity);

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
		]);

		$item = OrderItem::with('variant.product')->findOrFail($itemId);
		$cart = $item->order;

		if ($cart->customer_id !== $request->user()->id || $cart->status !== 'pending') {
			return response()->json(['message' => 'Unauthorized'], 403);
		}

		DB::beginTransaction();
		try {
			$diff = $request->quantity - $item->quantity;

			if ($diff > 0) {
				// We need more stock
				if ($item->variant->stock < $diff) {
					return response()->json(['message' => 'Insufficient stock'], 400);
				}
				$item->variant->decrement('stock', $diff);
			} elseif ($diff < 0) {
				// We return stock
				$item->variant->increment('stock', abs($diff));
			}

			$unitPrice = $this->getVariantUnitPrice($item->variant);
			$item->update([
				'quantity' => $request->quantity,
				'unit_price' => $unitPrice,
				'subtotal' => $request->quantity * $unitPrice
			]);

			$this->updateCartTotal($cart);

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
			// Return stock
			$item->variant->increment('stock', $item->quantity);
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
			'email' => ['required', 'email', 'max:255', Rule::unique('customers', 'email')->ignore($request->user()->id)],
			'phone' => ['required', 'string', 'max:50'],
			'address' => ['required', 'string', 'max:1000'],
			'city' => ['nullable', 'string', 'max:255'],
			'postal_code' => ['required', 'string', 'max:20'],
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

		$cart = Order::where('customer_id', $request->user()->id)
			->where('status', 'pending')
			->with('items.variant.product')
			->first();

		if (!$cart) {
			return response()->json(['message' => 'No active cart found'], 404);
		}

		if ($cart->items()->count() === 0) {
			return response()->json(['message' => 'Cannot checkout an empty cart'], 400);
		}

		$deliveryFee = (float) $deliveryMethod->fee;
		$paymentFee = (float) $paymentMethod->fee;
		$subtotal = $cart->items->reduce(function (float $total, OrderItem $item): float {
			return $total + ($this->getVariantUnitPrice($item->variant) * (int) $item->quantity);
		}, 0.0);
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

		DB::transaction(function () use (
			$cart,
			$request,
			$validated,
			$locality,
			$deliveryMethod,
			$paymentMethod,
			$city,
			$subtotal,
			$deliveryFee,
			$paymentFee,
			$couponDiscountAmount,
			$appliedCouponCode
		) {
			foreach ($cart->items as $item) {
				$unitPrice = $this->getVariantUnitPrice($item->variant);
				$item->update([
					'unit_price' => $unitPrice,
					'subtotal' => $unitPrice * (int) $item->quantity,
				]);
			}

			$cart->update([
				'status' => 'completed',
				'total_amount' => max($subtotal - $couponDiscountAmount, 0) + $deliveryFee + $paymentFee,
				'payment_method' => (string) $validated['payment_method_id'],
				'coupon_code' => $appliedCouponCode,
				'coupon_discount_amount' => $couponDiscountAmount,
				'shipping_address' => [
					'name' => $validated['name'],
					'email' => $validated['email'],
					'phone' => $validated['phone'],
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

			$request->user()->update([
				'name' => $validated['name'],
				'email' => $validated['email'],
				'phone' => $validated['phone'],
				'address' => $validated['address'],
				'postal_code' => $validated['postal_code'],
				'province_id' => $validated['province_id'],
				'locality_id' => $validated['locality_id'],
			]);
		});

		return response()->json([
			'message' => 'Order completed successfully',
			'order' => $cart->fresh()
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

	private function getVariantUnitPrice(?ProductVariant $variant): float
	{
		if (!$variant || !$variant->product) {
			return 0.0;
		}

		$originalPrice = round((float) $variant->product->sale_price, 2);
		$discount = max(min((float) ($variant->product->discount ?? 0), 100), 0);

		if ($discount <= 0) {
			return $originalPrice;
		}

		return round($originalPrice * (1 - ($discount / 100)), 2);
	}

	private function getVariantCompareAtPrice(?ProductVariant $variant): ?float
	{
		if (!$variant || !$variant->product) {
			return null;
		}

		$originalPrice = round((float) $variant->product->sale_price, 2);
		$unitPrice = $this->getVariantUnitPrice($variant);

		return $unitPrice < $originalPrice ? $originalPrice : null;
	}

	private function getVariantDiscountPercent(?ProductVariant $variant): float
	{
		if (!$variant || !$variant->product) {
			return 0.0;
		}

		return max(min((float) ($variant->product->discount ?? 0), 100), 0);
	}

	private function transformCart(Order $cart)
	{
		// Re-use logic for Next.js Commerce Cart interface
		return [
			'id' => (string) $cart->id,
			'checkoutUrl' => '/checkout/' . $cart->id, // Placeholder
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
				$compareAtPrice = $this->getVariantCompareAtPrice($item->variant);
				$discount = $this->getVariantDiscountPercent($item->variant);
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
