"use client";

import { usePriceMode } from "components/price-mode/price-mode-context";
import { isProductPurchasableInMode } from "lib/pricing";
import type { Product } from "lib/vadmin/types";

type ProductCountProps = {
  products: Product[];
};

export function ProductCount({ products }: ProductCountProps) {
  const { priceMode } = usePriceMode();
  const visibleCount = products.filter(
    (product) =>
      priceMode !== "wholesale" ||
      (!product.hideOnWholesale &&
        isProductPurchasableInMode(product, priceMode)),
  ).length;

  return (
    <p className="text-sm text-[#d85a3f]">
      {visibleCount} {visibleCount === 1 ? "producto" : "productos"}
    </p>
  );
}
