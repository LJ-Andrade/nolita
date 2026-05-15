"use client";

import { formatPriceAmount } from "components/price";
import { usePriceMode } from "components/price-mode/price-mode-context";
import { getProductModePrice } from "lib/pricing";
import type { Product } from "lib/vadmin/types";

type ProductPriceProps = {
  product: Product;
  className?: string;
  size?: "card" | "detail";
};

export function ProductPrice({
  product,
  className = "",
  size = "card",
}: ProductPriceProps) {
  const { priceMode } = usePriceMode();
  const price = {
    ...product.priceRange.minVariantPrice,
    amount: getProductModePrice(product, priceMode),
  };
  const compareAtPrice = priceMode === "retail" ? product.compareAtPriceRange?.minVariantPrice : null;
  const hasDiscount =
    priceMode === "retail" &&
    product.hasDiscount &&
    compareAtPrice &&
    Number(compareAtPrice.amount) > Number(price.amount);

  if (!hasDiscount) {
    return (
      <p className={className}>
        {formatPriceAmount(price.amount)}
      </p>
    );
  }

  const discount = Math.round(Number(product.discount ?? 0));
  const layoutClass =
    size === "detail"
      ? "flex flex-wrap items-center gap-3"
      : "flex flex-wrap items-center gap-x-2 gap-y-1";
  const priceClass = size === "detail" ? "text-2xl font-semibold" : "text-sm font-medium";
  const compareClass = size === "detail" ? "text-base" : "text-xs";

  return (
    <div className={`${layoutClass} ${className}`}>
      <span className={`${compareClass} text-neutral-400 line-through`}>
        {formatPriceAmount(compareAtPrice.amount)}
      </span>
      <span className={priceClass}>
        {formatPriceAmount(price.amount)}
      </span>
      {discount > 0 && (
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
          -{discount}%
        </span>
      )}
    </div>
  );
}
