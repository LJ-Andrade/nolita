"use client";

import { usePriceMode } from "components/price-mode/price-mode-context";
import { isProductVisibleInMode } from "lib/pricing";
import type { Product } from "lib/vadmin/types";

type ProductCountProps = {
  products: Product[];
  discountOnly?: boolean;
};

export function ProductCount({
  products,
  discountOnly = false,
}: ProductCountProps) {
  const { priceMode } = usePriceMode();
  const visibleCount = products.filter((product) =>
    isProductVisibleInMode(product, priceMode, discountOnly),
  ).length;

  return (
    <p className="text-sm text-[var(--pb-filter-accent)]">
      {visibleCount} {visibleCount === 1 ? "producto" : "productos"}
    </p>
  );
}
