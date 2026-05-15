"use client";

import clsx from "clsx";
import { usePriceMode } from "./price-mode-context";

export default function PriceModeSwitch() {
  const { priceMode, setPriceMode } = usePriceMode();
  const isWholesale = priceMode === "wholesale";

  return (
    <div className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.24em]">
      <button
        type="button"
        onClick={() => setPriceMode("retail")}
        className={clsx("transition-colors", !isWholesale ? "text-black" : "text-stone-brown/55 hover:text-black")}
      >
        Minorista
      </button>
      <span
        role="switch"
        tabIndex={0}
        aria-checked={isWholesale}
        aria-label="Cambiar modo mayorista"
        onClick={() => setPriceMode(isWholesale ? "retail" : "wholesale")}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setPriceMode(isWholesale ? "retail" : "wholesale");
          }
        }}
        className={clsx(
          "relative h-5 w-9 cursor-pointer rounded-full transition-colors",
          isWholesale ? "bg-graphite" : "bg-[#dbc4bd]"
        )}
      >
        <span
          className={clsx(
            "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
            isWholesale ? "translate-x-4" : "translate-x-0"
          )}
        />
      </span>
      <button
        type="button"
        onClick={() => setPriceMode("wholesale")}
        className={clsx("transition-colors", isWholesale ? "text-black" : "text-stone-brown/55 hover:text-black")}
      >
        Mayorista
      </button>
    </div>
  );
}
