import clsx from "clsx";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

export default function OpenCart({
	className,
	quantity,
}: {
	className?: string;
	quantity?: number;
}) {
	return (
		<div className="relative flex h-10 w-10 items-center justify-center rounded-[12px] text-black transition-colors hover:bg-bone">
			<ShoppingBagIcon className={clsx("h-5 w-5", className)} />

			{quantity ? (
				<div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
					{quantity}
				</div>
			) : null}
		</div>
	);
}
