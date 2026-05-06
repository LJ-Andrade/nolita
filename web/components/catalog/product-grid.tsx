import { ProductCard } from "components/catalog/product-card";
import type { Product } from "lib/vadmin/types";

type ProductGridProps = {
  products: Product[];
  favoriteIds?: Set<string>;
  isAuthenticated?: boolean;
};

export function ProductGrid({ products, favoriteIds, isAuthenticated = false }: ProductGridProps) {
  if (!products.length) {
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
          No se encontraron productos
        </p>
        <p className="text-xs" style={{ color: "var(--pb-text-muted)" }}>
          Probá con otros filtros
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={i < 6}
          isFavorited={favoriteIds?.has(product.id) ?? false}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
}
