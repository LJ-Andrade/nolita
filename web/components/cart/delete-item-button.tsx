"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { removeItem } from "components/cart/actions";
import type { CartItem } from "lib/vadmin/types";
import { useTransition } from "react";

export function DeleteItemButton({
	item,
	optimisticUpdate,
}: {
	item: CartItem;
	optimisticUpdate: any;
}) {
	const [isPending, startTransition] = useTransition();
	const merchandiseId = item.merchandise.id;

	const handleRemove = () => {
		startTransition(async () => {
			optimisticUpdate(merchandiseId, "delete");
			const result = await removeItem(null, merchandiseId);
			if (result) {
				const { toast } = await import("sonner");
				toast.error(result);
			}
		});
	};

	return (
		<button
			type="button"
			onClick={handleRemove}
			disabled={isPending}
			aria-label="Remove cart item"
			className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-graphite disabled:opacity-50"
		>
			<XMarkIcon className="mx-px h-4 w-4 text-parchment" />
		</button>
	);
}