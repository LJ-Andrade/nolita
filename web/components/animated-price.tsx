"use client";

import { formatPriceAmount } from "components/price";
import { useEffect, useMemo, useRef, useState } from "react";

export type AnimatedPriceDisplayValue = {
  amount: string;
  compareAtAmount?: string;
  discount?: number;
};

type AnimatedPriceProps = {
  className?: string;
  compareClass?: string;
  layoutClass?: string;
  priceClass?: string;
  value: AnimatedPriceDisplayValue;
};

type PriceDisplay = Required<Pick<AnimatedPriceDisplayValue, "amount">> &
  Pick<AnimatedPriceDisplayValue, "compareAtAmount" | "discount"> & {
    signature: string;
  };

function normalizeDisplay(value: AnimatedPriceDisplayValue): PriceDisplay {
  const discount = Number(value.discount ?? 0);

  return {
    amount: value.amount,
    compareAtAmount: value.compareAtAmount,
    discount,
    signature: `${value.amount}-${value.compareAtAmount ?? "none"}-${discount}`,
  };
}

export function AnimatedPrice({
  className = "",
  compareClass = "text-xs",
  layoutClass = "flex flex-wrap items-center gap-x-2 gap-y-1",
  priceClass = "",
  value,
}: AnimatedPriceProps) {
  const nextDisplay = useMemo(
    () => normalizeDisplay(value),
    [value.amount, value.compareAtAmount, value.discount],
  );
  const [displayedPrice, setDisplayedPrice] = useState(nextDisplay);
  const [previousPrice, setPreviousPrice] = useState<PriceDisplay | null>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      setDisplayedPrice(nextDisplay);
      return;
    }

    if (nextDisplay.signature === displayedPrice.signature) {
      return;
    }

    setPreviousPrice(displayedPrice);
    setDisplayedPrice(nextDisplay);

    const timeout = window.setTimeout(() => {
      setPreviousPrice(null);
    }, 460);

    return () => window.clearTimeout(timeout);
  }, [displayedPrice, nextDisplay]);

  return (
    <span className={`price-mode-slide ${className}`}>
      <span key={displayedPrice.signature} className="price-mode-slide-current">
        <PriceContent
          compareClass={compareClass}
          display={displayedPrice}
          layoutClass={layoutClass}
          priceClass={priceClass}
        />
      </span>
      {previousPrice && (
        <span
          key={previousPrice.signature}
          aria-hidden="true"
          className="price-mode-slide-previous"
        >
          <PriceContent
            compareClass={compareClass}
            display={previousPrice}
            layoutClass={layoutClass}
            priceClass={priceClass}
          />
        </span>
      )}
    </span>
  );
}

function PriceContent({
  compareClass,
  display,
  layoutClass,
  priceClass,
}: {
  compareClass: string;
  display: PriceDisplay;
  layoutClass: string;
  priceClass: string;
}) {
  if (!display.compareAtAmount) {
    return (
      <span className={priceClass}>{formatPriceAmount(display.amount)}</span>
    );
  }

  return (
    <span className={layoutClass}>
      <span className={`${compareClass} text-neutral-400 line-through`}>
        {formatPriceAmount(display.compareAtAmount)}
      </span>
      <span className={priceClass}>{formatPriceAmount(display.amount)}</span>
      {Number(display.discount ?? 0) > 0 && (
        <span
          className="rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-wide"
          style={{
            backgroundColor: "var(--pb-accent)",
            color: "var(--pb-badge-text)",
          }}
        >
          %{Math.round(Number(display.discount))}
        </span>
      )}
    </span>
  );
}
