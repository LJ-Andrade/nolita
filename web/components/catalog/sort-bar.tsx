"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { ReactNode } from "react";

const SORT_OPTIONS = [
  { label: "Más nuevo", value: "newest" },
  { label: "Menor precio", value: "price_asc" },
  { label: "Mayor precio", value: "price_desc" },
  { label: "Nombre A–Z", value: "name_asc" },
] as const;

type SortValue = typeof SORT_OPTIONS[number]["value"];

type SortBarProps = {
  total: number;
  filtersAction?: ReactNode;
};

export function SortBar({ total, filtersAction }: SortBarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentSort = (searchParams.get("sort") ?? "newest") as SortValue;

  const setSort = useCallback(
    (value: SortValue) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", value);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 py-4"
      style={{ borderBottom: "1px solid var(--pb-border)" }}
    >
      {/* Count */}
      <p
        className="text-xs font-medium uppercase tracking-widest"
        style={{ color: "var(--pb-text-muted)" }}
      >
        {total} {total === 1 ? "producto" : "productos"}
      </p>

      <div className="flex items-center gap-3">
        {filtersAction}
        <span
          className="hidden text-xs uppercase tracking-widest sm:inline"
          style={{ color: "var(--pb-text-muted)" }}
        >
          Ordenar:
        </span>
        <select
          value={currentSort}
          onChange={(e) => setSort(e.target.value as SortValue)}
          className="border-0 bg-transparent text-xs font-medium uppercase tracking-widest outline-none cursor-pointer"
          style={{ color: "var(--pb-text)" }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
