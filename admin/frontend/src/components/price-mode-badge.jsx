import { Badge } from "@/components/ui/badge";
import { Building2, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

// Visual indicator of how an order was placed: wholesale (mayorista) vs
// retail (minorista). Colors are chosen to not clash with the order status
// badges (yellow/blue/green/red).
export function PriceModeBadge({ mode, className }) {
	const isWholesale = mode === "wholesale";

	return (
		<Badge
			variant="outline"
			className={cn(
				isWholesale
					? "bg-purple-500/10 text-purple-500 border-purple-500/20"
					: "bg-slate-500/10 text-slate-500 border-slate-500/20",
				className
			)}
		>
			{isWholesale ? (
				<Building2 className="mr-1 h-3 w-3" />
			) : (
				<ShoppingBag className="mr-1 h-3 w-3" />
			)}
			{isWholesale ? "Mayorista" : "Minorista"}
		</Badge>
	);
}
