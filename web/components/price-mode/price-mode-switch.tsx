"use client";

import clsx from "clsx";
import { usePriceMode } from "./price-mode-context";

export default function PriceModeSwitch() {
  const { priceMode, setPriceMode } = usePriceMode();
  const isWholesale = priceMode === "wholesale";

  return (
    <div className="flex items-center border border-gray-200 p-0.5 text-[14px] font-semibold uppercase tracking-[0.18em]">
      <button
        type="button"
        onClick={() => setPriceMode("retail")}
        className={clsx(
          "flex items-center gap-1.5 px-3.5 py-1.5 transition-all",
          !isWholesale
            ? "bg-[#D4006A] text-white shadow-sm"
            : "text-stone-brown hover:text-black",
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
          "flex items-center gap-1.5 px-3.5 py-1.5 transition-all",
          isWholesale
            ? "bg-[#D4006A] text-white shadow-sm"
            : "text-stone-brown hover:text-black",
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
