"use client";

import clsx from "clsx";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type ColorFilterOption = {
  name: string;
  hex?: string;
};

type OpenPanel = "category" | "colors" | "sizes" | null;

type EditorialFilterControlsProps = {
  categories: Collection[];
  colors: ColorFilterOption[];
  sizes: string[];
  total: number;
  showAllCategoryNav?: boolean;
};

export function EditorialFilterControls({
  categories,
  colors,
  sizes,
  total,
  showAllCategoryNav = true,
}: EditorialFilterControlsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const [footerOffset, setFooterOffset] = useState(0);
  const filterControlsRef = useRef<HTMLDivElement | null>(null);

  const activeCategory =
    searchParams.get("categoria") ?? searchParams.get("category") ?? "";
  const activeColors = searchParams.getAll("color");
  const activeSizes = searchParams.getAll("size");

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
  const sortedColors = useMemo(
    () => [...colors].sort((a, b) => a.name.localeCompare(b.name)),
    [colors],
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

  const toggleColor = useCallback(
    (color: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.getAll("color");

      params.delete("color");
      current
        .filter((value) => value !== color)
        .forEach((value) => params.append("color", value));

      if (!current.includes(color)) {
        params.append("color", color);
      }

      pushParams(params);
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

  useEffect(() => {
    if (!openPanel) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        filterControlsRef.current?.contains(target)
      ) {
        return;
      }

      setOpenPanel(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [openPanel]);

  useEffect(() => {
    let frame = 0;

    const updateFooterOffset = () => {
      frame = 0;
      const footer = document.querySelector("footer");

      if (!footer) {
        setFooterOffset(0);
        return;
      }

      const { top } = footer.getBoundingClientRect();
      const visibleFooterHeight = Math.max(0, window.innerHeight - top);
      setFooterOffset(
        Math.min(visibleFooterHeight, Math.max(0, window.innerHeight - 104)),
      );
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateFooterOffset);
    };

    updateFooterOffset();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <section
        className="border-y bg-white"
        style={{ borderColor: "var(--pb-border)" }}
        aria-label="Categorías del catálogo"
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-5 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {showAllCategoryNav && (
              <CategoryPill
                active={!activeCategory}
                label="Todos"
                onClick={() => setCategory("")}
              />
            )}
            {categories.map((category) => (
              <CategoryPill
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
          bottom: `calc(1.5rem + ${footerOffset}px)`,
          opacity: scrollOpacity,
          transform: `translateY(${(1 - scrollOpacity) * 10}px)`,
        }}
      >
        <div
          ref={filterControlsRef}
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
                "catalog-filter-menu absolute left-0 w-[232px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-180px)] overflow-y-auto bg-white py-2 shadow-2xl ring-1 ring-black/5 sm:left-auto sm:right-[10rem]",
                "bottom-[4.5rem]",
              )}
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

          {openPanel === "colors" && (
            <div
              className={clsx(
                "catalog-filter-menu absolute left-1/2 grid w-[232px] -translate-x-1/2 grid-cols-1 gap-1 bg-white p-2 shadow-2xl ring-1 ring-black/5 sm:w-[260px] sm:grid-cols-2",
                "bottom-[4.5rem]",
              )}
            >
              {sortedColors.map((color) => {
                const active = activeColors.includes(color.name);

                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => toggleColor(color.name)}
                    className={clsx(
                      "flex h-11 items-center gap-3 px-3 text-left text-xs font-medium uppercase tracking-[0.12em] outline-none transition-colors",
                      active
                        ? "bg-[#fbf7f4] text-[var(--pb-filter-accent)]"
                        : "text-[var(--pb-text)] hover:bg-[#fbf7f4]",
                    )}
                    style={{ borderRadius: 2 }}
                    aria-pressed={active}
                  >
                    <span
                      className="h-4 w-4 shrink-0 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: color.hex ?? "#CCCCCC" }}
                    />
                    <span className="truncate">{color.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {openPanel === "sizes" && (
            <div
              className={clsx(
                "catalog-filter-menu absolute left-1/2 grid w-[190px] -translate-x-1/2 grid-cols-3 gap-2 bg-white p-4 shadow-2xl ring-1 ring-black/5",
                "bottom-[4.5rem]",
              )}
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
                        ? "border-[var(--pb-filter-accent)] bg-white text-[var(--pb-filter-accent)]"
                        : "border-[var(--pb-border)] bg-white text-[var(--pb-text)] hover:border-[var(--pb-accent)]",
                    )}
                    style={{
                      borderRadius: 2,
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

          <PillButton
            active={openPanel === "category"}
            label={activeCategory ? activeCategoryTitle : "Categorías"}
            onClick={() => togglePanel("category")}
          />
          <PillButton
            active={openPanel === "colors"}
            label="Colores"
            onClick={() => togglePanel("colors")}
          />
          <PillButton
            active={openPanel === "sizes"}
            label="Talles"
            onClick={() => togglePanel("sizes")}
          />
        </div>
      </div>

      <p className="sr-only">
        {total} {total === 1 ? "producto encontrado" : "productos encontrados"}
      </p>
    </>
  );
}

function CategoryPill({
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
        "border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] outline-none transition-colors",
          active
            ? "border-[var(--pb-filter-accent)] bg-[var(--pb-filter-accent)] text-white"
            : "border-black/15 bg-white text-black hover:border-black hover:text-black",
      )}
      style={{ borderRadius: 2 }}
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
        active
          ? "font-semibold text-[var(--pb-filter-accent)]"
          : "text-[var(--pb-text)]",
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
        active ? "text-[var(--pb-filter-accent)]" : "text-[var(--pb-text)]",
      )}
      style={{
        borderRadius: 2,
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
