"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Collection } from "lib/vadmin/types";

type FilterSidebarProps = {
  categories: Collection[];
  sizes: string[];
  layout?: "desktop" | "mobile";
  footer?: ReactNode;
};

const SIZES_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Único"];

type SectionTitleProps = { children: ReactNode };
function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h3
      className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
      style={{ color: "var(--pb-text-muted)" }}
    >
      {children}
    </h3>
  );
}

export function FilterSidebar({ categories, sizes, layout = "desktop", footer }: FilterSidebarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const activeCategory = searchParams.get("categoria") ?? searchParams.get("category") ?? "";
  const activeSizes = searchParams.getAll("size");

  const updateParam = useCallback(
    (key: string, value: string, multi = false) => {
      const params = new URLSearchParams(searchParams.toString());

      if (multi) {
        const current = params.getAll(key);
        if (current.includes(value)) {
          // Remove this value
          params.delete(key);
          current.filter((v) => v !== value).forEach((v) => params.append(key, v));
        } else {
          params.append(key, value);
        }
      } else {
        if (key === "categoria") {
          params.delete("category");
        }
        if (params.get(key) === value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      // Reset to page 1 when filters change
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const clearAll = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const hasActiveFilters =
    !!activeCategory || activeSizes.length > 0;

  const sortedSizes = [...sizes].sort(
    (a, b) => SIZES_ORDER.indexOf(a) - SIZES_ORDER.indexOf(b)
  );

  return (
    <aside
      className={clsx(
        "flex h-full w-full flex-col gap-8",
        layout === "desktop" ? "py-6 pr-6" : "py-4",
      )}
      style={{ color: "var(--pb-text)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--pb-text)" }}
        >
          Filtros
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-[10px] underline underline-offset-2 transition-opacity hover:opacity-60"
            style={{ color: "var(--pb-text-secondary)" }}
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* ── Categoría ──────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section>
          <SectionTitle>Categoría</SectionTitle>
          <ul className="flex flex-col gap-2">
            <li>
              <button
                onClick={() => router.push(pathname, { scroll: false })}
                className={`text-left text-sm transition-all ${
                  !activeCategory
                    ? "font-semibold"
                    : "opacity-50 hover:opacity-80"
                }`}
                style={{ color: "var(--pb-text)" }}
              >
                Todo
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.handle}>
                <button
                  onClick={() => updateParam("categoria", cat.handle)}
                  className={`text-left text-sm transition-all ${
                    activeCategory === cat.handle
                      ? "font-semibold"
                      : "opacity-50 hover:opacity-80"
                  }`}
                  style={{ color: "var(--pb-text)" }}
                >
                  {cat.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Separator */}
      <div style={{ borderTop: "1px solid var(--pb-border)" }} />

      {/* ── Talle ──────────────────────────────────────────────────── */}
      {sortedSizes.length > 0 && (
        <section>
          <SectionTitle>Talle</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {sortedSizes.map((size) => {
              const active = activeSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => updateParam("size", size, true)}
                  className="min-w-[2.5rem] px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-all"
                  style={{
                    border: `1px solid ${active ? "var(--pb-accent)" : "var(--pb-border)"}`,
                    backgroundColor: active ? "var(--pb-accent)" : "transparent",
                    color: active ? "#FFFFFF" : "var(--pb-text)",
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {footer}
    </aside>
  );
}
