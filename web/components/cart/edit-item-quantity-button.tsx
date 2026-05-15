"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { updateItemQuantity } from "components/cart/actions";
import type { CartItem } from "lib/vadmin/types";
import { useTransition } from "react";
import { toast } from "sonner";

export function EditItemQuantityButton({
  item,
  type,
  optimisticUpdate,
  tone = "dark",
}: {
  item: CartItem;
  type: "plus" | "minus";
  optimisticUpdate: any;
  tone?: "dark" | "light";
}) {
  const [isPending, startTransition] = useTransition();

  const availableStock = item.merchandise.product.stock;
  const isPlusDisabled =
    type === "plus" && availableStock !== undefined && availableStock <= 0;

  const handleAction = async () => {
    if (isPlusDisabled) {
      toast.error("Stock insuficiente", {
        description:
          "Has alcanzado el límite de unidades disponibles para este producto.",
      });
      return;
    }

    const newQuantity = type === "plus" ? item.quantity + 1 : item.quantity - 1;
    const payload = {
      merchandiseId: item.merchandise.id,
      quantity: newQuantity,
    };

    startTransition(async () => {
      // Optimistic update
      optimisticUpdate(payload.merchandiseId, type);

      const rollback = () => {
        const rollbackType = type === "plus" ? "minus" : "plus";
        optimisticUpdate(payload.merchandiseId, rollbackType);
      };

      try {
        const result = await updateItemQuantity(null, payload);
        if (
          result &&
          (result.toLowerCase().includes("stock") ||
            result.includes("Insufficient"))
        ) {
          rollback();
          toast.error("Stock insuficiente", {
            description: "No hay más unidades disponibles de este producto.",
          });
        } else if (result) {
          rollback();
          toast.error(result);
        }
      } catch (e: any) {
        rollback();
        toast.error("Error al actualizar la cantidad");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleAction}
      disabled={isPending || isPlusDisabled}
      aria-label={type === "plus" ? "Aumentar cantidad" : "Reducir cantidad"}
      className={clsx(
        "ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full p-2 transition-all duration-200",
        tone === "light" ? "hover:bg-white/10" : "hover:bg-bone",
        {
          "ml-auto": type === "minus",
          "opacity-30 cursor-not-allowed": isPending || isPlusDisabled,
        },
      )}
    >
      {type === "plus" ? (
        <PlusIcon className={clsx("h-4 w-4", isPending && "animate-pulse")} />
      ) : (
        <MinusIcon className={clsx("h-4 w-4", isPending && "animate-pulse")} />
      )}
    </button>
  );
}
