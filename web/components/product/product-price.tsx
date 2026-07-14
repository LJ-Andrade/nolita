"use client";

import { AnimatedPrice } from "components/animated-price";
import { usePriceMode } from "components/price-mode/price-mode-context";
import { getProductPriceDisplay } from "lib/pricing";
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
  const { amount, compareAtAmount, discount } = getProductPriceDisplay(
    product,
    priceMode,
  );
  const layoutClass =
    size === "detail"
      ? "flex flex-wrap items-center gap-3"
      : "flex flex-wrap items-center gap-x-2 gap-y-1";
  const priceClass =
    size === "detail" ? "text-2xl font-semibold" : "text-sm font-medium";
  const compareClass = size === "detail" ? "text-base" : "text-xs";

  return (
    <AnimatedPrice
      className={className}
      compareClass={compareClass}
      layoutClass={layoutClass}
      priceClass={priceClass}
      value={{ amount, compareAtAmount, discount }}
    />
  );
}
