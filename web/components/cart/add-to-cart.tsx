"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import LoadingDots from "components/loading-dots";
import { usePriceMode } from "components/price-mode/price-mode-context";
import { isProductPurchasableInMode, priceVariantForMode } from "lib/pricing";
import { Product, ProductVariant } from "lib/vadmin/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { addItem } from "./actions";
import { useCart } from "./cart-context";

function SubmitButton({
  availableForSale,
  selectedVariantId,
  isPending,
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
  isPending: boolean;
}) {
  const buttonClasses =
    "relative flex h-11 w-full items-center justify-center bg-[#f4f1ee] px-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600 transition-colors duration-200";

  if (!availableForSale) {
    return (
      <button
        type="button"
        disabled
        className={clsx(buttonClasses, "cursor-not-allowed opacity-55")}
      >
        Sin stock
      </button>
    );
  }

  if (!selectedVariantId) {
    return (
      <button
        type="button"
        aria-label="Por favor selecciona una opción"
        disabled
        className={clsx(buttonClasses, "cursor-not-allowed text-neutral-400")}
      >
        Seleccionar talle
      </button>
    );
  }

  return (
    <button
      type="submit"
      aria-label="Agregar al carrito"
      disabled={isPending}
      className={clsx(buttonClasses, "hover:bg-[#ebe6e1] disabled:opacity-70")}
    >
      {isPending ? (
        <LoadingDots className="bg-neutral-700" />
      ) : (
        <>Agregar al carrito</>
      )}
    </button>
  );
}

function QuantitySelector({
  quantity,
  max,
  disabled,
  onChange,
}: {
  quantity: number;
  max: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const baseBtn =
    "flex h-full w-10 items-center justify-center text-black transition-colors duration-150 hover:bg-neutral-50";

  return (
    <div
      className={clsx(
        "flex h-11 w-[138px] items-stretch border border-neutral-300 bg-white text-black select-none",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      <button
        type="button"
        aria-label="Reducir cantidad"
        onClick={() => {
          if (quantity > 1) onChange(quantity - 1);
        }}
        disabled={disabled || quantity <= 1}
        className={clsx(baseBtn, "disabled:opacity-30")}
      >
        <MinusIcon className="h-4 w-4" />
      </button>

      <span className="flex min-w-14 items-center justify-center border-x border-neutral-200 text-xs font-medium tabular-nums text-neutral-700">
        {quantity}
      </span>

      <button
        type="button"
        aria-label="Aumentar cantidad"
        onClick={() => {
          if (quantity < max) onChange(quantity + 1);
        }}
        disabled={disabled || quantity >= max}
        className={clsx(baseBtn, "disabled:opacity-30")}
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { variants } = product;
  const { cart, addCartItem, updateCartItem } = useCart();
  const { priceMode } = usePriceMode();
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState<number>(1);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuantity(1);
  }, [searchParams]);

  const variant = variants.find((candidate: ProductVariant) =>
    candidate.selectedOptions.every(
      (option) =>
        option.value.toLowerCase() ===
        searchParams.get(option.name.toLowerCase())?.toLowerCase(),
    ),
  );

  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const finalVariant = variants.find(
    (candidate) => candidate.id === selectedVariantId,
  );
  const pricedVariant = finalVariant
    ? priceVariantForMode(finalVariant, product, priceMode)
    : finalVariant;
  const isPurchasableInMode = isProductPurchasableInMode(product, priceMode);
  const isAvailable =
    Boolean(variant ? variant.availableForSale : product.availableForSale) &&
    isPurchasableInMode;
  const stockLimit = finalVariant?.quantityAvailable ?? (isAvailable ? 99 : 0);
  const quantityDisabled = !isAvailable;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!pricedVariant || !isAvailable || stockLimit === 0) {
      toast.error("Sin stock disponible para esta variante.");
      return;
    }

    if (quantity > stockLimit) {
      toast.error(`Solo quedan ${stockLimit} unidades disponibles.`);
      return;
    }

    startTransition(async () => {
      if (!selectedVariantId) return;

      const existed = cart?.lines?.some(
        (line) => line.merchandise.id === selectedVariantId,
      );

      addCartItem(pricedVariant, product, quantity);

      const result = await addItem(null, selectedVariantId, quantity);
      if (result) {
        toast.error(result);
        if (existed) {
          for (let index = 0; index < quantity; index += 1) {
            updateCartItem(selectedVariantId, "minus");
          }
        } else {
          updateCartItem(selectedVariantId, "delete");
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div>
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-black">
          Cantidad
        </p>
        <QuantitySelector
          quantity={quantity}
          max={stockLimit > 0 ? stockLimit : 1}
          disabled={quantityDisabled}
          onChange={setQuantity}
        />
      </div>

      <div className="mt-6">
        <SubmitButton
          availableForSale={isAvailable}
          selectedVariantId={selectedVariantId}
          isPending={isPending}
        />
      </div>
    </form>
  );
}
