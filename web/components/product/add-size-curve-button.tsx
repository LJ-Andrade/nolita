"use client";

import { addMultipleItems } from "components/cart/actions";
import { useCart } from "components/cart/cart-context";
import type { Product } from "lib/vadmin/types";
import { useTransition } from "react";
import { toast } from "sonner";

type AddSizeCurveButtonProps = {
  product: Product;
  className?: string;
  compact?: boolean;
};

export function AddSizeCurveButton({
  product,
  className = "",
  compact = false,
}: AddSizeCurveButtonProps) {
  const { addMultipleCartItems } = useCart();
  const [isPending, startTransition] = useTransition();
  const availableVariants = product.variants?.filter((variant) => variant.availableForSale) || [];

  if (availableVariants.length === 0) return null;

  const handleAdd = () => {
    startTransition(async () => {
      addMultipleCartItems(availableVariants, product);
      const error = await addMultipleItems(null, availableVariants.map((variant) => variant.id));

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Curva de talle agregada");
    });
  };

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        handleAdd();
      }}
      disabled={isPending}
      className={
        className ||
        (compact
          ? "flex h-12 w-52 flex-col items-center justify-center rounded-[var(--pb-radius)] border border-white bg-white text-[10px] font-semibold uppercase leading-tight tracking-[0.2em] text-black shadow-lg transition-all hover:bg-neutral-100 disabled:opacity-50"
          : "flex h-12 w-full items-center justify-center rounded-[var(--pb-radius)] border border-black bg-white px-6 text-xs font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-white disabled:opacity-50")
      }
    >
      {isPending ? (
        "Agregando..."
      ) : compact ? (
        <>
          <span>Agregar curva</span>
          <span>de talle</span>
        </>
      ) : (
        "Agregar curva de talles"
      )}
    </button>
  );
}
