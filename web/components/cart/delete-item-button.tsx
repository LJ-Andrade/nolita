"use client";

import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { removeItem } from "components/cart/actions";
import type { CartItem } from "lib/vadmin/types";
import { useTransition } from "react";
import { toast } from "sonner";

export function DeleteItemButton({
  item,
  optimisticUpdate,
  onRemoveStart,
  tone = "dark",
}: {
  item: CartItem;
  optimisticUpdate: any;
  onRemoveStart?: (merchandiseId: string) => void;
  tone?: "dark" | "light" | "checkout";
}) {
  const [isPending, startTransition] = useTransition();
  const merchandiseId = item.merchandise.id;
  const itemName = item.merchandise.product.title;

  const handleRemove = () => {
    startTransition(async () => {
      if (!item.id) {
        onRemoveStart?.(merchandiseId);
        toast.success(`${itemName} eliminado`);
        window.setTimeout(() => {
          optimisticUpdate(merchandiseId, "delete");
        }, 260);
        return;
      }

      const result = await removeItem(null, merchandiseId);
      if (result) {
        toast.error(result);
      } else {
        onRemoveStart?.(merchandiseId);
        toast.success(`${itemName} eliminado`);
        window.setTimeout(() => {
          optimisticUpdate(merchandiseId, "delete");
        }, 260);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isPending}
      aria-label="Remove cart item"
      className={clsx(
        "flex shrink-0 items-center justify-center disabled:opacity-50 transition-colors",
        tone === "light" && "h-[24px] w-[24px] bg-white text-black",
        tone === "dark" &&
          "h-[24px] w-[24px] text-[#f87171] hover:text-[#ef4444]",
        tone === "checkout" &&
          "h-7 w-7 rounded-full bg-[#fee2e2] text-[#ef4444] hover:bg-[#fecaca]",
      )}
    >
      {tone === "light" ? (
        <XMarkIcon className="mx-px h-4 w-4" />
      ) : (
        <TrashIcon className="h-4 w-4" />
      )}
    </button>
  );
}
