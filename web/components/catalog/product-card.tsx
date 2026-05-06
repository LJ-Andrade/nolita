"use client";

import { Product } from "lib/vadmin/types";
import { COLOR_MAP } from "lib/constants";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useCart } from "components/cart/cart-context";
import { addMultipleItems } from "components/cart/actions";
import { toast } from "sonner";
import { formatPriceAmount } from "components/price";

type ProductCardProps = {
	product: Product;
	priority?: boolean;
};

function AddSizeCurveButton({ product }: { product: Product }) {
	const { addMultipleCartItems } = useCart();
	const [isPending, startTransition] = useTransition();

	const availableVariants = product.variants?.filter(v => v.availableForSale) || [];

	if (availableVariants.length === 0) return null;

	const handleAdd = () => {
		startTransition(async () => {
			addMultipleCartItems(availableVariants, product);
			const error = await addMultipleItems(null, availableVariants.map(v => v.id));
			if (error) {
				toast.error(error);
			} else {
				toast.success("Curva de talle agregada");
			}
		});
	};

	return (
		<button
			onClick={(e) => { e.preventDefault(); handleAdd(); }}
			disabled={isPending}
			className="mt-3 rounded-none border border-white px-4 py-1.5 text-[10px] font-medium uppercase tracking-widest text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black disabled:opacity-50"
		>
			{isPending ? "Agregando..." : "Agregar curva de talle"}
		</button>
	);
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
	const defaultImageUrl =
		product.featuredImage?.url ?? product.images?.[0]?.url ?? "";
	const [currentImage, setCurrentImage] = useState(defaultImageUrl);
	const imageUrl = currentImage || defaultImageUrl;

	const imageAlt =
		product.featuredImage?.altText ?? product.title;

	const price = product.priceRange.minVariantPrice;
	const isNew =
		new Date(product.updatedAt) >
		new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

	// Extract unique color swatches from variants
	const colors = product.options
		.find((o) => o.name === "Color")
		?.values.slice(0, 5) ?? [];



	const getColorHex = (name: string): string =>
		COLOR_MAP[name.toLowerCase()] ?? "#CCCCCC";

	return (
		<article className="pb-card group relative flex flex-col">
			{/* ── Image ──────────────────────────────────────────────────── */}
			<Link
				href={`/product/${product.handle}`}
				className="relative block overflow-hidden rounded-[12px] isolate"
				style={{ aspectRatio: "4/5", backgroundColor: "var(--pb-surface)" }}
			>
				{imageUrl ? (
					<Image
						src={imageUrl}
						alt={imageAlt}
						fill
						sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
						className="pb-card-image object-cover"
						priority={priority}
					/>
				) : (
					<div
						className="absolute inset-0 flex items-center justify-center"
						style={{ color: "var(--pb-text-muted)" }}
					>
						<span className="text-xs uppercase tracking-widest">Sin imagen</span>
					</div>
				)}

				{/* Badge NUEVO */}
				{isNew && (
					<span
						className="absolute left-3 top-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em]"
						style={{
							backgroundColor: "var(--pb-badge-bg)",
							color: "var(--pb-badge-text)",
						}}
					>
						Nuevo
					</span>
				)}

				{/* Hover overlay — "Ver producto" */}
				<div
					className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					style={{ background: "rgba(0,0,0,0.1)" }}
				>
					<span className="rounded-none border border-white px-6 py-2 text-xs font-medium uppercase tracking-[0.15em] text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black">
						Ver producto
					</span>
					<AddSizeCurveButton product={product} />
				</div>
			</Link>

			{/* ── Info ───────────────────────────────────────────────────── */}
			<div className="flex flex-col gap-1.5 p-3 pt-3">
				{/* Category tag */}
				{product.tags?.[0] && (
					<span
						className="text-[10px] font-medium uppercase tracking-widest"
						style={{ color: "var(--pb-text-muted)" }}
					>
						{product.tags[0]}
					</span>
				)}

				{/* Color swatches — Moved above Title */}
				{colors.length > 0 && (
					<div className="mb-0.5 flex items-center gap-1.5">
						{colors.map((color) => {
							const hex = getColorHex(color);
							const colorImage = product.colorImages?.find(
								(ci) => ci.color.toLowerCase() === color.toLowerCase()
							);

							return (
								<button
									key={color}
									title={color}
									type="button"
									onClick={(e) => {
										e.preventDefault();
										if (colorImage?.url) {
											setCurrentImage(colorImage.url);
										} else {
											setCurrentImage(defaultImageUrl);
										}
									}}
									className={`h-4 w-4 cursor-pointer rounded-full border border-white ring-1 transition-transform hover:scale-125 ${currentImage === colorImage?.url && colorImage?.url
											? "ring-black scale-125"
											: "ring-gray-300"
										}`}
									style={{ backgroundColor: hex }}
								/>
							);
						})}

						{/* Reset button */}
						{currentImage !== defaultImageUrl && (
							<button
								type="button"
								title="Restablecer vista"
								onClick={(e) => {
									e.preventDefault();
									setCurrentImage(defaultImageUrl);
								}}
								className="ml-0.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-black/5 text-[8px] text-black/40 transition-colors hover:bg-black/10 hover:text-black/60"
							>
								✕
							</button>
						)}
					</div>
				)}

				{/* Product name — Serif */}
				<Link
					href={`/product/${product.handle}`}
					className="line-clamp-2 text-sm font-medium leading-snug transition-opacity hover:opacity-70"
					style={{ fontFamily: "var(--font-serif)", color: "var(--pb-text)" }}
				>
					{product.title}
				</Link>

				{/* Price */}
				<p
					className="text-sm font-medium"
					style={{ color: "var(--pb-text)" }}
				>
					{formatPriceAmount(price.amount)}
				</p>
			</div>
		</article>
	);
}
