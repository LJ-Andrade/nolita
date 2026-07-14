import type { Product, ProductVariant } from "lib/vadmin/types";
import type { PriceMode } from "components/price-mode/price-mode-context";

function applyDiscount(
  price: string | null | undefined,
  discount: number | null | undefined,
): string {
  const numericPrice = Number(price ?? 0);
  const safeDiscount = Math.min(Math.max(Number(discount ?? 0), 0), 100);

  return String(
    Math.round(numericPrice * (1 - safeDiscount / 100) * 100) / 100,
  );
}

export function getProductModePrice(product: Product, mode: PriceMode): string {
  if (mode === "wholesale") {
    return applyDiscount(product.wholesalePrice, product.wholesaleDiscount);
  }

  return product.priceRange.minVariantPrice.amount;
}

export type ProductPriceDisplay = {
  amount: string;
  compareAtAmount?: string;
  discount: number;
};

// Resolves the price, strikethrough (compareAt) and discount badge for a product
// in the given mode. Both retail and wholesale use the same badge/strikethrough
// format: the pre-discount price is shown crossed out and the discount percentage
// is exposed as the badge value.
export function getProductPriceDisplay(
  product: Product,
  mode: PriceMode,
): ProductPriceDisplay {
  if (mode === "wholesale") {
    const wholesaleDiscount = Math.min(
      Math.max(Number(product.wholesaleDiscount ?? 0), 0),
      100,
    );
    const basePrice = product.wholesalePrice ?? "0";
    const amount = applyDiscount(basePrice, wholesaleDiscount);
    const hasDiscount =
      wholesaleDiscount > 0 && Number(amount) < Number(basePrice);

    return {
      amount,
      compareAtAmount: hasDiscount ? basePrice : undefined,
      discount: hasDiscount ? Math.round(wholesaleDiscount) : 0,
    };
  }

  const amount = product.priceRange.minVariantPrice.amount;
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice;
  const hasDiscount = Boolean(
    product.hasDiscount &&
      compareAtPrice &&
      Number(compareAtPrice.amount) > Number(amount),
  );

  return {
    amount,
    compareAtAmount: hasDiscount ? compareAtPrice?.amount : undefined,
    discount: hasDiscount ? Math.round(Number(product.discount ?? 0)) : 0,
  };
}

// A product counts as "on sale" only for the discount that matches the active
// price mode. In wholesale mode a retail-only discount must not qualify, and
// vice versa. Mirrors the badge shown by getProductPriceDisplay.
export function productHasDiscountInMode(
  product: Product,
  mode: PriceMode,
): boolean {
  return getProductPriceDisplay(product, mode).discount > 0;
}

// Whether a product should appear in the catalog for the given mode and filters.
// Single source of truth shared by the grid card, the product count and the
// filter controls so every count stays consistent with what is rendered.
export function isProductVisibleInMode(
  product: Product,
  mode: PriceMode,
  discountOnly = false,
): boolean {
  if (
    mode === "wholesale" &&
    (product.hideOnWholesale || !isProductPurchasableInMode(product, mode))
  ) {
    return false;
  }

  if (discountOnly && !productHasDiscountInMode(product, mode)) {
    return false;
  }

  return true;
}

export function isProductPurchasableInMode(
  product: Product,
  mode: PriceMode,
): boolean {
  return Number(getProductModePrice(product, mode)) > 0;
}

export function priceVariantForMode(
  variant: ProductVariant,
  product: Product,
  mode: PriceMode,
): ProductVariant {
  if (mode === "wholesale") {
    const wholesaleDiscount = Math.min(
      Math.max(Number(product.wholesaleDiscount ?? 0), 0),
      100,
    );
    const wholesalePrice = product.wholesalePrice ?? "0";
    const wholesaleFinalPrice = applyDiscount(
      wholesalePrice,
      wholesaleDiscount,
    );
    const hasWholesaleDiscount =
      wholesaleDiscount > 0 &&
      Number(wholesaleFinalPrice) < Number(wholesalePrice);

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
    compareAtPrice:
      product.compareAtPriceRange?.minVariantPrice ??
      variant.compareAtPrice ??
      null,
    discount: product.discount,
    hasDiscount: product.hasDiscount,
  };
}
