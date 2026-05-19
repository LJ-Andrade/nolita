"use client";

import clsx from "clsx";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const SORT_OPTIONS = [
  { label: "Destacados", value: "featured" },
  { label: "Últimos Ingresos", value: "newest" },
  { label: "Mayor Descuento", value: "discount_desc" },
  { label: "Precio: Menor a Mayor", value: "price_asc" },
  { label: "Precio: Mayor a Menor", value: "price_desc" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function CatalogFilterAction() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentSort = (searchParams.get("sort") ?? "featured") as SortValue;
  const [isOpen, setIsOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDetailsElement | null>(null);

  const setSort = useCallback(
    (value: SortValue) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "featured") {
        params.delete("sort");
      } else {
        params.set("sort", value);
      }

      params.delete("page");
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
      setIsOpen(false);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && sortMenuRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <details
      ref={sortMenuRef}
      className="group relative shrink-0"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary
        className="catalog-filter-pill flex h-10 min-w-[118px] cursor-pointer items-center justify-center gap-2 border border-[var(--pb-filter-accent)] bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--pb-filter-accent)] outline-none transition-colors hover:bg-[#fbf7f4] sm:min-w-[132px] sm:text-xs [&::-webkit-details-marker]:hidden"
        style={{ borderRadius: 2, listStyle: "none" }}
      >
        Filtrar
        <ChevronDownIcon
          className={clsx(
            "h-3.5 w-3.5 transition-transform",
            "group-open:rotate-180",
          )}
        />
      </summary>

      <div
        className="catalog-filter-menu absolute right-0 top-[calc(100%+0.75rem)] z-40 w-[232px] max-w-[calc(100vw-2rem)] overflow-hidden bg-white py-2 shadow-2xl ring-1 ring-black/5"
      >
        <p className="px-6 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/45">
          Ordenar por
        </p>
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSort(option.value)}
            className={clsx(
              "block w-full px-6 py-3 text-left text-sm outline-none transition-colors hover:bg-[#fbf7f4]",
              currentSort === option.value
                ? "font-semibold text-[var(--pb-filter-accent)]"
                : "text-[var(--pb-text)]",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </details>
  );
}
