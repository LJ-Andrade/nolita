"use client";

import { useRouter } from "next/navigation";
import React, { createContext, useContext, useMemo, useState } from "react";

export type PriceMode = "retail" | "wholesale";

type PriceModeContextType = {
  priceMode: PriceMode;
  setPriceMode: (mode: PriceMode) => void;
};

const PriceModeContext = createContext<PriceModeContextType | undefined>(undefined);

function normalizeMode(mode?: string | null): PriceMode {
  return mode === "wholesale" ? "wholesale" : "retail";
}

export function PriceModeProvider({
  initialMode = "retail",
  children,
}: {
  initialMode?: PriceMode | string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [priceMode, setPriceModeState] = useState<PriceMode>(normalizeMode(initialMode));

  const setPriceMode = (mode: PriceMode) => {
    setPriceModeState(mode);
    window.localStorage.setItem("nolita_price_mode", mode);
    document.cookie = `nolita_price_mode=${mode}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  const value = useMemo(() => ({ priceMode, setPriceMode }), [priceMode]);

  return (
    <PriceModeContext.Provider value={value}>
      {children}
    </PriceModeContext.Provider>
  );
}

export function usePriceMode() {
  const context = useContext(PriceModeContext);
  if (!context) {
    throw new Error("usePriceMode must be used within PriceModeProvider");
  }

  return context;
}
