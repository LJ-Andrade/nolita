"use client";

import { ProductCard } from "components/catalog/product-card";
import { usePriceMode } from "components/price-mode/price-mode-context";
import { isProductVisibleInMode } from "lib/pricing";
import type { Product } from "lib/vadmin/types";

type ProductGridProps = {
  products: Product[];
  showColors?: boolean;
  discountOnly?: boolean;
};

export function ProductGrid({
  products,
  showColors = true,
  discountOnly = false,
}: ProductGridProps) {
  const { priceMode } = usePriceMode();
  // Visibility depends on the active price mode (retail/wholesale) and the
  // "Con descuento" filter, both resolved on the client. Filtering here keeps
  // the empty state in sync with what is actually rendered.
  const visibleProducts = products.filter((product) =>
    isProductVisibleInMode(product, priceMode, discountOnly),
  );

  if (!visibleProducts.length) {
    return (
      <div
        className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-20"
        style={{ color: "var(--pb-text-muted)" }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <p className="text-sm uppercase tracking-widest">
          No hay productos con el filtro seleccionado
        </p>
        <p className="text-xs" style={{ color: "var(--pb-text-muted)" }}>
          Probá con otros filtros
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {visibleProducts.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={i < 6}
          showColors={showColors}
          discountOnly={discountOnly}
        />
      ))}
    </div>
  );
}
