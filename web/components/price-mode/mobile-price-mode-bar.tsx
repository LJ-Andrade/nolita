"use client";

import clsx from "clsx";
import { usePriceMode } from "./price-mode-context";

export default function MobilePriceModeBar() {
  const { priceMode, setPriceMode } = usePriceMode();
  const isWholesale = priceMode === "wholesale";

  return (
    <div className="grid h-10 grid-cols-2 border-b border-black/10 bg-white md:hidden">
      <button
        type="button"
        onClick={() => setPriceMode("retail")}
        className={clsx(
          "flex items-center justify-center text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
          !isWholesale
            ? "bg-[#C51162] text-white"
            : "bg-white text-black hover:bg-[#fbf7f4]",
        )}
        aria-pressed={!isWholesale}
      >
        Minorista
      </button>
      <button
        type="button"
        onClick={() => setPriceMode("wholesale")}
        className={clsx(
          "flex items-center justify-center border-l border-black/10 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
          isWholesale
            ? "bg-[#C51162] text-white"
            : "bg-white text-black hover:bg-[#fbf7f4]",
        )}
        aria-pressed={isWholesale}
      >
        Mayorista
      </button>
    </div>
  );
}
