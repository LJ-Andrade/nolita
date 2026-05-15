import type { Product, ProductVariant } from "lib/vadmin/types";
import type { PriceMode } from "components/price-mode/price-mode-context";

export function getProductModePrice(product: Product, mode: PriceMode): string {
  if (mode === "wholesale") {
    return product.wholesalePrice ?? "0";
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
    return {
      ...variant,
      price: {
        ...variant.price,
        amount: product.wholesalePrice ?? "0",
      },
      compareAtPrice: null,
      discount: 0,
      hasDiscount: false,
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
