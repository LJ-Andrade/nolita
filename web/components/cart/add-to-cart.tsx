"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { addItem } from "components/cart/actions";
import { Product, ProductVariant } from "lib/vadmin/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useCart } from "./cart-context";
import LoadingDots from "components/loading-dots";
import { toast } from "sonner";
import { usePriceMode } from "components/price-mode/price-mode-context";
import { isProductPurchasableInMode, priceVariantForMode } from "lib/pricing";

// ---------------------------------------------------------------------------
// SubmitButton
// ---------------------------------------------------------------------------
function SubmitButton({
	availableForSale,
	selectedVariantId,
	isPending,
}: {
	availableForSale: boolean;
	selectedVariantId: string | undefined;
	isPending: boolean;
}) {
	const buttonClasses =
		"relative flex w-full items-center justify-center py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200 rounded-none";

	if (!availableForSale) {
		return (
			<button
				type="button"
				disabled
				className={clsx(buttonClasses, "bg-bone/50 text-stone-brown/40 cursor-not-allowed")}
			>
				Sin Stock
			</button>
		);
	}

	if (!selectedVariantId) {
		return (
			<button
				type="button"
				aria-label="Por favor selecciona una opción"
				disabled
				className={clsx(buttonClasses, "bg-bone/20 text-stone-brown/60 border border-bone/50 cursor-not-allowed")}
			>
				Seleccionar Opciones
			</button>
		);
	}

	return (
		<button
			type="submit"
			aria-label="Agregar al carrito"
			disabled={isPending}
			className={clsx(buttonClasses, "bg-graphite text-parchment hover:opacity-90")}
		>
			{isPending ? (
				<LoadingDots className="bg-parchment" />
			) : (
				<>
					Agregar al carrito
				</>
			)}
		</button>
	);
}

// ---------------------------------------------------------------------------
// QuantitySelector
// ---------------------------------------------------------------------------
function QuantitySelector({
	quantity,
	max,
	disabled,
	onChange,
}: {
	quantity: number;
	max: number;
	disabled: boolean;
	onChange: (value: number) => void;
}) {
	const baseBtn =
		"flex h-full items-center justify-center px-3 transition-opacity duration-150 rounded-none";

	return (
		<div
			className={clsx(
				"flex h-full items-stretch border-r border-white/20 bg-graphite text-parchment select-none",
				disabled && "opacity-40 pointer-events-none",
			)}
		>
			{/* Decrease */}
			<button
				type="button"
				aria-label="Reducir cantidad"
				onClick={() => { if (quantity > 1) onChange(quantity - 1); }}
				disabled={disabled || quantity <= 1}
				className={clsx(baseBtn, "hover:opacity-70 disabled:opacity-30")}
			>
				<MinusIcon className="h-3 w-3" />
			</button>

			{/* Value */}
			<span className="flex items-center justify-center min-w-8 text-xs font-bold tabular-nums">
				{quantity}
			</span>

			{/* Increase */}
			<button
				type="button"
				aria-label="Aumentar cantidad"
				onClick={() => { if (quantity < max) onChange(quantity + 1); }}
				disabled={disabled || quantity >= max}
				className={clsx(baseBtn, "hover:opacity-70 disabled:opacity-30")}
			>
				<PlusIcon className="h-3 w-3" />
			</button>
		</div>
	);
}

// ---------------------------------------------------------------------------
// AddToCart
// ---------------------------------------------------------------------------
export function AddToCart({ product }: { product: Product }) {
	const { variants } = product;
	const { cart, addCartItem, updateCartItem } = useCart();
	const { priceMode } = usePriceMode();
	const searchParams = useSearchParams();
	const [quantity, setQuantity] = useState<number>(1);
	const [isPending, startTransition] = useTransition();

	// Reset quantity when variant selection changes
	useEffect(() => {
		setQuantity(1);
	}, [searchParams]);

	// Resolve selected variant from URL params
	const variant = variants.find((v: ProductVariant) =>
		v.selectedOptions.every(
			(opt) =>
				opt.value.toLowerCase() ===
				searchParams.get(opt.name.toLowerCase())?.toLowerCase(),
		),
	);

	const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
	const selectedVariantId = variant?.id || defaultVariantId;
	const finalVariant = variants.find((v) => v.id === selectedVariantId)!;
	const pricedVariant = finalVariant ? priceVariantForMode(finalVariant, product, priceMode) : finalVariant;
	const isPurchasableInMode = isProductPurchasableInMode(product, priceMode);

	// Availability & stock limit
	const isAvailable = (variant ? variant.availableForSale : product.availableForSale) && isPurchasableInMode;
	const stockLimit: number =
		finalVariant?.quantityAvailable ?? (isAvailable ? 99 : 0);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Client-side stock validation before hitting the server
		if (!finalVariant || !isAvailable || stockLimit === 0) {
			toast.error("Sin stock disponible para esta variante.");
			return;
		}
		if (quantity > stockLimit) {
			toast.error(`Solo quedan ${stockLimit} unidades disponibles.`);
			return;
		}

		// Server action called directly — avoids useActionState bind arity issues
		startTransition(async () => {
			if (!selectedVariantId) return;

			const existed = cart?.lines?.some(l => l.merchandise.id === selectedVariantId);

			// Optimistic cart update
			addCartItem(pricedVariant, product, quantity);

			const result = await addItem(null, selectedVariantId, quantity);
			if (result) {
				toast.error(result);
				// Rollback optimistic update
				if (existed) {
					for (let i = 0; i < quantity; i++) updateCartItem(selectedVariantId, "minus");
				} else {
					updateCartItem(selectedVariantId, "delete");
				}
			}
		});
	};

	const selectorDisabled = !selectedVariantId || !isAvailable;

	return (
		<form onSubmit={handleSubmit}>
			<div className="flex h-[52px] w-full overflow-hidden rounded-[12px]">
				{/* Quantity selector */}
				<QuantitySelector
					quantity={quantity}
					max={stockLimit > 0 ? stockLimit : 1}
					disabled={selectorDisabled}
					onChange={setQuantity}
				/>

				{/* Submit button */}
				<SubmitButton
					availableForSale={isAvailable}
					selectedVariantId={selectedVariantId}
					isPending={isPending}
				/>
			</div>
		</form>
	);
}
