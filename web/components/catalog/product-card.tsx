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
import { usePriceMode } from "components/price-mode/price-mode-context";
import { isProductPurchasableInMode } from "lib/pricing";

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
  const { priceMode } = usePriceMode();
  const defaultImageUrl =
    product.featuredImage?.url ?? product.images?.[0]?.url ?? "";
  const [currentImage, setCurrentImage] = useState(defaultImageUrl);
  const [favorited, setFavorited] = useState(isFavorited);
  const [isPending, startTransition] = useTransition();
  const imageUrl = currentImage || defaultImageUrl;

  const imageAlt = product.featuredImage?.altText ?? product.title;

  const colorOption = product.options.find((o) => o.name === "Color");
  const colors = colorOption?.values.slice(0, 5) ?? [];
  const hexValues = colorOption?.hexValues ?? [];

  const getColorHex = (name: string, index: number): string => {
    if (hexValues[index]) return hexValues[index];
    return COLOR_MAP[name.toLowerCase()] ?? "#CCCCCC";
  };

  if (
    priceMode === "wholesale" &&
    (product.hideOnWholesale || !isProductPurchasableInMode(product, priceMode))
  ) {
    return null;
  }

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push(
        `/ingreso?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
      return;
    }
    startTransition(async () => {
      const newState = !favorited;
      setFavorited(newState);
      await toggleFavoriteAction(product.id, !newState);
      toast.success(
        newState
          ? `${product.title} agregado a favoritos`
          : `${product.title} eliminado de favoritos`,
      );
    });
  };

  return (
    <article className="pb-card group relative flex flex-col">
      {/* ── Image ──────────────────────────────────────────────────── */}
      <Link
        href={`/producto/${product.handle}`}
        className="relative isolate block overflow-hidden"
        style={{
          aspectRatio: "5/7",
          backgroundColor: "var(--pb-surface)",
          display: "block",
          isolation: "isolate",
          overflow: "hidden",
          position: "relative",
          width: "100%",
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="pb-card-image object-cover"
            style={{ objectFit: "cover" }}
            priority={priority}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: "var(--pb-text-muted)" }}
          >
            <span className="text-xs uppercase tracking-widest">
              Sin imagen
            </span>
          </div>
        )}

        {/* Favorite heart */}
        <button
          type="button"
          onClick={handleFavoriteToggle}
          className="absolute left-2.5 top-2.5 z-10 transition-transform hover:scale-110"
          aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <HeartIcon
            className={`h-5 w-5 drop-shadow-sm transition-colors ${favorited ? "fill-red-500 text-red-500" : "text-white"}`}
          />
        </button>
      </Link>

      {/* ── Info ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 pt-2 px-0.5">
        {/* Title row: name left, color swatches right */}
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/producto/${product.handle}`}
            className="line-clamp-2 text-sm leading-snug transition-opacity hover:opacity-70"
            style={{ fontFamily: "var(--font-sans)", color: "var(--pb-text)" }}
          >
            {product.title}
          </Link>

          {showColors && colors.length > 0 && (
            <div className="flex shrink-0 items-center gap-1 mt-0.5">
              {colors.map((color, i) => {
                const colorImage = product.colorImages?.find(
                  (ci) => ci.color.toLowerCase() === color.toLowerCase(),
                );
                const hex = colorImage?.hex ?? getColorHex(color, i);

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
                    className={`h-4 w-4 cursor-pointer shrink-0 rounded-full transition-transform hover:scale-125 ${
                      currentImage === colorImage?.url && colorImage?.url
                        ? "ring-2 ring-offset-1 ring-black scale-125"
                        : "ring-1 ring-offset-1 ring-gray-200"
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                );
              })}

              {currentImage !== defaultImageUrl && (
                <button
                  type="button"
                  title="Restablecer vista"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImage(defaultImageUrl);
                  }}
                  className="flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full bg-black/5 text-[7px] text-black/40 transition-colors hover:bg-black/10 hover:text-black/60"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        <ProductPrice product={product} className="text-sm" />
      </div>
    </article>
  );
}
