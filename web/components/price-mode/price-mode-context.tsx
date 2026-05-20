"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type PriceMode = "retail" | "wholesale";

type PriceModeContextType = {
  priceMode: PriceMode;
  setPriceMode: (mode: PriceMode) => void;
};

const PriceModeContext = createContext<PriceModeContextType | undefined>(
  undefined,
);

function normalizeMode(mode?: string | null): PriceMode {
  return mode === "wholesale" ? "wholesale" : "retail";
}

function persistPriceMode(mode: PriceMode) {
  try {
    window.localStorage.setItem("nolita_price_mode", mode);
  } catch {
    // Cookie persistence is the source of truth for server-rendered data.
  }

  document.cookie = `nolita_price_mode=${mode}; path=/; max-age=31536000; samesite=lax`;
}

export function PriceModeProvider({
  initialMode = "retail",
  children,
}: {
  initialMode?: PriceMode | string;
  children: React.ReactNode;
}) {
  const [priceMode, setPriceModeState] = useState<PriceMode>(
    normalizeMode(initialMode),
  );
  const normalizedInitialMode = normalizeMode(initialMode);

  useEffect(() => {
    try {
      const storedMode = window.localStorage.getItem("nolita_price_mode");
      if (!storedMode) return;

      const normalizedStoredMode = normalizeMode(storedMode);
      if (normalizedStoredMode === normalizedInitialMode) return;

      setPriceModeState(normalizedStoredMode);
      persistPriceMode(normalizedStoredMode);
    } catch {
      persistPriceMode(normalizedInitialMode);
    }
  }, [normalizedInitialMode]);

  const setPriceMode = useCallback((mode: PriceMode) => {
    const normalizedMode = normalizeMode(mode);

    setPriceModeState(normalizedMode);
    persistPriceMode(normalizedMode);
  }, []);

  const value = useMemo(
    () => ({ priceMode, setPriceMode }),
    [priceMode, setPriceMode],
  );

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
