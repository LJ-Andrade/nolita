"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
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
  tone?: "dark" | "light";
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
        "flex h-[24px] w-[24px] items-center justify-center disabled:opacity-50",
        tone === "light" ? "bg-white text-black" : "bg-graphite text-parchment",
      )}
    >
      <XMarkIcon className="mx-px h-4 w-4" />
    </button>
  );
}
