"use client";

import { Product } from "lib/vadmin/types";
import { COLOR_MAP } from "lib/constants";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { HeartIcon } from "@heroicons/react/24/outline";
import { toggleFavoriteAction } from "lib/vadmin/favorites-actions";
import { ProductPrice } from "components/product/product-price";

type ProductCardProps = {
	product: Product;
	priority?: boolean;
	isFavorited?: boolean;
	isAuthenticated?: boolean;
	showColors?: boolean;
};

export function ProductCard({
	product,
	priority = false,
	isFavorited = false,
	isAuthenticated = false,
	showColors = true,
}: ProductCardProps) {
	const router = useRouter();
	const defaultImageUrl =
		product.featuredImage?.url ?? product.images?.[0]?.url ?? "";
	const [currentImage, setCurrentImage] = useState(defaultImageUrl);
	const [favorited, setFavorited] = useState(isFavorited);
	const [isPending, startTransition] = useTransition();
	const imageUrl = currentImage || defaultImageUrl;

	const imageAlt =
		product.featuredImage?.altText ?? product.title;

	const isNew =
		new Date(product.updatedAt) >
		new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

	// Extract unique color swatches from variants
	const colors = product.options
		.find((o) => o.name === "Color")
		?.values.slice(0, 5) ?? [];



	const getColorHex = (name: string): string =>
		COLOR_MAP[name.toLowerCase()] ?? "#CCCCCC";

	const handleFavoriteToggle = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isAuthenticated) {
			router.push(`/ingreso?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
			return;
		}
		startTransition(async () => {
			const newState = !favorited;
			setFavorited(newState);
			await toggleFavoriteAction(product.id, !newState);
			toast.success(newState
				? `${product.title} agregado a favoritos`
				: `${product.title} eliminado de favoritos`
			);
		});
	};

	return (
		<article className="pb-card group relative flex flex-col">
			{/* ── Image ──────────────────────────────────────────────────── */}
			<Link
				href={`/producto/${product.handle}`}
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

				{/* Favorite heart */}
				<button
					type="button"
					onClick={handleFavoriteToggle}
					className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:bg-white hover:scale-110"
					aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
				>
					<HeartIcon
						className={`h-5 w-5 transition-colors ${favorited ? "fill-red-500 text-red-500" : "text-gray-500"}`}
					/>
				</button>
			</Link>

			{/* ── Info ───────────────────────────────────────────────────── */}
			<div className="flex flex-col gap-1.5 p-3 pt-3">
				{/* Color swatches — Moved above Title */}
				{showColors && colors.length > 0 && (
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
					href={`/producto/${product.handle}`}
					className="line-clamp-2 text-sm font-medium leading-snug transition-opacity hover:opacity-70"
					style={{ fontFamily: "var(--font-serif)", color: "var(--pb-text)" }}
				>
					{product.title}
				</Link>

				<ProductPrice
					product={product}
					className="text-sm font-medium"
				/>
			</div>
		</article>
	);
}
