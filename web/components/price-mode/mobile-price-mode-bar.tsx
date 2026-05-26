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
          "flex items-center justify-center gap-1.5 text-[14px] font-semibold uppercase tracking-[0.18em] transition-colors",
          !isWholesale
            ? "bg-[#C51162] text-white"
            : "bg-white text-black hover:bg-[#fbf7f4]",
        )}
        aria-pressed={!isWholesale}
      >
        {!isWholesale && (
          <span className="h-1.5 w-1.5 rounded-full bg-[#1FAD57]" />
        )}
        Minorista
      </button>
      <button
        type="button"
        onClick={() => setPriceMode("wholesale")}
        className={clsx(
          "flex items-center justify-center gap-1.5 border-l border-black/10 text-[14px] font-semibold uppercase tracking-[0.18em] transition-colors",
          isWholesale
            ? "bg-[#C51162] text-white"
            : "bg-white text-black hover:bg-[#fbf7f4]",
        )}
        aria-pressed={isWholesale}
      >
        {isWholesale && (
          <span className="h-1.5 w-1.5 rounded-full bg-[#1FAD57]" />
        )}
        Mayorista
      </button>
    </div>
  );
}
