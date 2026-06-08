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

const PRICE_MODE_COOKIE = "nolita_price_mode_v2";
const PRICE_MODE_STORAGE_KEY = "nolita_price_mode";

const PriceModeContext = createContext<PriceModeContextType | undefined>(
  undefined,
);

function normalizeMode(mode?: string | null): PriceMode {
  return mode === "retail" ? "retail" : "wholesale";
}

function persistPriceMode(mode: PriceMode) {
  try {
    window.localStorage.setItem(PRICE_MODE_STORAGE_KEY, mode);
  } catch {
    // Cookie persistence keeps server-rendered data in sync when storage is unavailable.
  }

  document.cookie = `${PRICE_MODE_COOKIE}=${mode}; path=/; max-age=31536000; samesite=lax`;
}

function readClientStoredPriceMode(): PriceMode | null {
  try {
    const storedMode = window.localStorage.getItem(PRICE_MODE_STORAGE_KEY);
    return storedMode ? normalizeMode(storedMode) : null;
  } catch {
    return null;
  }
}

function readClientCookiePriceMode(): PriceMode | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`${PRICE_MODE_COOKIE}=([^;]+)`),
  );
  return match ? normalizeMode(match[1]) : null;
}

export function PriceModeProvider({
  initialMode = "wholesale",
  children,
}: {
  initialMode?: PriceMode | string;
  children: React.ReactNode;
}) {
  const [priceMode, setPriceModeState] = useState<PriceMode>(
    normalizeMode(initialMode),
  );

  useEffect(() => {
    const storedMode = readClientStoredPriceMode();
    const persistedMode = storedMode ?? readClientCookiePriceMode();
    const normalizedInitialMode = normalizeMode(initialMode);
    const nextMode = persistedMode ?? normalizedInitialMode;

    persistPriceMode(nextMode);

    if (nextMode !== normalizedInitialMode) {
      setPriceModeState(nextMode);
    }
  }, [initialMode]);

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
