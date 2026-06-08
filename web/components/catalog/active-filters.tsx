"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { Collection } from "lib/vadmin/types";

const SORT_LABELS: Record<string, string> = {
  featured: "Destacados",
  newest: "Últimos Ingresos",
  discount_desc: "Con descuento",
  price_asc: "Precio: Menor a Mayor",
  price_desc: "Precio: Mayor a Menor",
};

type ActiveFiltersProps = {
  categories?: Collection[];
};

export function ActiveFilters({ categories = [] }: ActiveFiltersProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const category =
    searchParams.get("categoria") ?? searchParams.get("category");
  const colors = searchParams.getAll("color");
  const sizes = searchParams.getAll("size");
  const sort = searchParams.get("sort");
  const categoryTitle =
    categories.find((item) => item.handle === category)?.title ?? category;

  const hasFilters =
    !!category || colors.length > 0 || sizes.length > 0 || !!sort;

  const removeFilter = useCallback(
    (key: string, value?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        const current = params.getAll(key).filter((v) => v !== value);
        params.delete(key);
        current.forEach((v) => params.append(key, v));
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const removeCategoryFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("categoria");
    params.delete("category");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const clearAll = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-0">
      {category && (
        <FilterChip
          label={`Categoría: ${categoryTitle}`}
          onRemove={removeCategoryFilter}
        />
      )}
      {sizes.map((size) => (
        <FilterChip
          key={size}
          label={`Talle: ${size}`}
          onRemove={() => removeFilter("size", size)}
        />
      ))}
      {colors.map((color) => (
        <FilterChip
          key={color}
          label={`Color: ${color}`}
          onRemove={() => removeFilter("color", color)}
        />
      ))}
      {sort && (
        <FilterChip
          label={`Orden: ${SORT_LABELS[sort] ?? sort}`}
          onRemove={() => removeFilter("sort")}
        />
      )}
      <button
        onClick={clearAll}
        className="text-[11px] underline underline-offset-2 transition-opacity hover:opacity-60"
        style={{ color: "var(--pb-text-secondary)" }}
      >
        Limpiar todo
      </button>
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span
      className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium uppercase leading-none tracking-wide"
      style={{
        border: "1px solid var(--pb-border)",
        color: "var(--pb-text)",
        backgroundColor: "var(--pb-surface)",
      }}
    >
      {label}
      <button
        onClick={onRemove}
        aria-label={`Quitar filtro: ${label}`}
        className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full transition-opacity hover:opacity-60"
        style={{ backgroundColor: "var(--pb-text)", color: "#fff" }}
      >
        <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
          <path
            d="M1 1l6 6M7 1L1 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </span>
  );
}
