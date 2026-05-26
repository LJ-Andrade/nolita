import type { Product, ProductVariant } from "lib/vadmin/types";
import type { PriceMode } from "components/price-mode/price-mode-context";

function applyDiscount(price: string | null | undefined, discount: number | null | undefined): string {
  const numericPrice = Number(price ?? 0);
  const safeDiscount = Math.min(Math.max(Number(discount ?? 0), 0), 100);

  return String(Math.round(numericPrice * (1 - safeDiscount / 100) * 100) / 100);
}

export function getProductModePrice(product: Product, mode: PriceMode): string {
  if (mode === "wholesale") {
    return applyDiscount(product.wholesalePrice, product.wholesaleDiscount);
  }

  return product.priceRange.minVariantPrice.amount;
}

export function isProductPurchasableInMode(product: Product, mode: PriceMode): boolean {
  return Number(getProductModePrice(product, mode)) > 0;
}

export function priceVariantForMode(
  variant: ProductVariant,
  product: Product,
  mode: PriceMode,
): ProductVariant {
  if (mode === "wholesale") {
    const wholesaleDiscount = Math.min(Math.max(Number(product.wholesaleDiscount ?? 0), 0), 100);
    const wholesalePrice = product.wholesalePrice ?? "0";
    const wholesaleFinalPrice = applyDiscount(wholesalePrice, wholesaleDiscount);
    const hasWholesaleDiscount = wholesaleDiscount > 0 && Number(wholesaleFinalPrice) < Number(wholesalePrice);

    return {
      ...variant,
      price: {
        ...variant.price,
        amount: wholesaleFinalPrice,
      },
      compareAtPrice: hasWholesaleDiscount
        ? { ...variant.price, amount: wholesalePrice }
        : null,
      discount: wholesaleDiscount,
      hasDiscount: hasWholesaleDiscount,
    };
  }

  return {
    ...variant,
    price: {
      ...variant.price,
      amount: product.priceRange.minVariantPrice.amount,
    },
    compareAtPrice: product.compareAtPriceRange?.minVariantPrice ?? variant.compareAtPrice ?? null,
    discount: product.discount,
    hasDiscount: product.hasDiscount,
  };
}
