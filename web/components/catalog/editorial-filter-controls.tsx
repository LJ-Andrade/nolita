"use client";

import clsx from "clsx";
import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Collection } from "lib/vadmin/types";

const SIZES_ORDER = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "Unico",
  "Único",
];

const SORT_OPTIONS = [
  { label: "Destacados", value: "featured" },
  { label: "Últimos Ingresos", value: "newest" },
  { label: "Mayor Descuento", value: "discount_desc" },
  { label: "Precio: Menor a Mayor", value: "price_asc" },
  { label: "Precio: Mayor a Menor", value: "price_desc" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];
type OpenPanel = "category" | "sizes" | "filter" | null;

type EditorialFilterControlsProps = {
  categories: Collection[];
  sizes: string[];
  total: number;
};

export function EditorialFilterControls({
  categories,
  sizes,
  total,
}: EditorialFilterControlsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [scrollOpacity, setScrollOpacity] = useState(0);

  const activeCategory =
    searchParams.get("categoria") ?? searchParams.get("category") ?? "";
  const activeSizes = searchParams.getAll("size");
  const currentSort = (searchParams.get("sort") ?? "featured") as SortValue;

  const sortedSizes = useMemo(
    () =>
      [...sizes].sort((a, b) => {
        const aIndex = SIZES_ORDER.indexOf(a);
        const bIndex = SIZES_ORDER.indexOf(b);

        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      }),
    [sizes],
  );

  const activeCategoryTitle =
    categories.find((category) => category.handle === activeCategory)?.title ??
    "Categoría";
  const pushParams = useCallback(
    (params: URLSearchParams) => {
      params.delete("page");
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const setCategory = useCallback(
    (handle: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("category");

      if (handle) {
        params.set("categoria", handle);
      } else {
        params.delete("categoria");
      }

      pushParams(params);
      setOpenPanel(null);
    },
    [pushParams, searchParams],
  );

  const toggleSize = useCallback(
    (size: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.getAll("size");

      params.delete("size");
      current
        .filter((value) => value !== size)
        .forEach((value) => params.append("size", value));

      if (!current.includes(size)) {
        params.append("size", size);
      }

      pushParams(params);
    },
    [pushParams, searchParams],
  );

  const setSort = useCallback(
    (value: SortValue) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "featured") {
        params.delete("sort");
      } else {
        params.set("sort", value);
      }

      pushParams(params);
      setOpenPanel(null);
    },
    [pushParams, searchParams],
  );

  const togglePanel = useCallback((panel: OpenPanel) => {
    setOpenPanel((current) => (current === panel ? null : panel));
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateOpacity = () => {
      frame = 0;
      setScrollOpacity(Math.min(window.scrollY / 160, 1));
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateOpacity);
    };

    updateOpacity();
    window.addEventListener("scroll", requestUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (scrollOpacity < 0.05) {
      setOpenPanel(null);
    }
  }, [scrollOpacity]);

  return (
    <>
      <section
        className="border-y bg-white"
        style={{ borderColor: "var(--pb-border)" }}
        aria-label="Categorías del catálogo"
      >
        <div className="no-scrollbar mx-auto flex w-full max-w-screen-2xl items-center justify-start overflow-x-auto px-4 py-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:justify-center lg:px-8">
          <div className="flex min-w-max items-center gap-8">
            <CategoryNavButton
              active={!activeCategory}
              label="Todos"
              onClick={() => setCategory("")}
            />
            {categories.map((category) => (
              <CategoryNavButton
                key={category.handle}
                active={activeCategory === category.handle}
                label={category.title}
                onClick={() => setCategory(category.handle)}
              />
            ))}
          </div>
        </div>
      </section>

      <div
        className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"
        style={{
          opacity: scrollOpacity,
          transform: `translateY(${(1 - scrollOpacity) * 10}px)`,
        }}
      >
        <div
          className={clsx(
            "relative flex items-center justify-center gap-2 sm:gap-3",
            scrollOpacity > 0.05
              ? "pointer-events-auto"
              : "pointer-events-none",
          )}
        >
          {openPanel === "category" && (
            <div
              className={clsx(
                "absolute left-0 w-[232px] max-w-[calc(100vw-2rem)] overflow-hidden bg-white py-2 shadow-2xl ring-1 ring-black/5 sm:left-auto sm:right-[14rem]",
                "bottom-[4.5rem]",
              )}
              style={{ borderRadius: 18 }}
            >
              <DropdownButton
                active={!activeCategory}
                label="Todas las categorías"
                onClick={() => setCategory("")}
              />
              {categories.map((category) => (
                <DropdownButton
                  key={category.handle}
                  active={activeCategory === category.handle}
                  label={category.title}
                  onClick={() => setCategory(category.handle)}
                />
              ))}
            </div>
          )}

          {openPanel === "sizes" && (
            <div
              className={clsx(
                "absolute left-1/2 grid w-[190px] -translate-x-1/2 grid-cols-3 gap-2 bg-white p-4 shadow-2xl ring-1 ring-black/5",
                "bottom-[4.5rem]",
              )}
              style={{ borderRadius: 18 }}
            >
              {sortedSizes.map((size) => {
                const active = activeSizes.includes(size);

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={clsx(
                      "catalog-size-chip flex h-10 items-center justify-center border text-[13px] outline-none transition-colors",
                      active
                        ? "border-[#d85a3f] bg-white text-[#d85a3f]"
                        : "border-[var(--pb-border)] bg-white text-[var(--pb-text)] hover:border-[var(--pb-accent)]",
                    )}
                    style={{
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                    aria-pressed={active}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          )}

          {openPanel === "filter" && (
            <div
              className={clsx(
                "absolute right-0 w-[232px] max-w-[calc(100vw-2rem)] overflow-hidden bg-white py-2 shadow-2xl ring-1 ring-black/5",
                "bottom-[4.5rem]",
              )}
              style={{ borderRadius: 18 }}
            >
              <p className="px-6 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/45">
                Ordenar por
              </p>
              {SORT_OPTIONS.map((option) => (
                <DropdownButton
                  key={option.value}
                  active={currentSort === option.value}
                  label={option.label}
                  onClick={() => setSort(option.value)}
                />
              ))}
            </div>
          )}

          <PillButton
            active={openPanel === "category"}
            label={activeCategory ? activeCategoryTitle : "Categoría"}
            onClick={() => togglePanel("category")}
          />
          <PillButton
            active={openPanel === "sizes"}
            label="Talles"
            onClick={() => togglePanel("sizes")}
          />
          <button
            type="button"
            onClick={() => togglePanel("filter")}
            className="catalog-filter-pill flex h-10 min-w-[104px] items-center justify-center gap-2 border border-[#d85a3f] bg-white/70 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d85a3f] backdrop-blur-md outline-none transition-colors hover:bg-white sm:min-w-[132px] sm:px-5 sm:text-xs sm:tracking-[0.18em]"
            style={{
              borderRadius: 9999,
              overflow: "hidden",
            }}
            aria-expanded={openPanel === "filter"}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            Filtrar
          </button>
        </div>
      </div>

      <p className="sr-only">
        {total} {total === 1 ? "producto encontrado" : "productos encontrados"}
      </p>
    </>
  );
}

function CategoryNavButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "border-b pb-3 text-xs uppercase tracking-[0.3em] outline-none transition-colors",
        active
          ? "border-[#d85a3f] text-[#d85a3f]"
          : "border-transparent text-black/45 hover:text-black",
      )}
    >
      {label}
    </button>
  );
}

function DropdownButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "block w-full px-6 py-3 text-left text-sm outline-none transition-colors hover:bg-[#fbf7f4]",
        active ? "font-semibold text-[#d85a3f]" : "text-[var(--pb-text)]",
      )}
    >
      {label}
    </button>
  );
}

function PillButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "catalog-filter-pill flex h-10 min-w-[98px] items-center justify-center gap-2 border border-black/10 bg-white/70 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md outline-none transition-colors hover:bg-white sm:min-w-[124px] sm:px-5 sm:text-xs sm:tracking-[0.17em]",
        active ? "text-[#d85a3f]" : "text-[var(--pb-text)]",
      )}
      style={{
        borderRadius: 9999,
        overflow: "hidden",
      }}
      aria-expanded={active}
    >
      <span>{label}</span>
      {active ? (
        <ChevronUpIcon className="h-4 w-4" />
      ) : (
        <ChevronDownIcon className="h-4 w-4" />
      )}
    </button>
  );
}
