import { Heart, ShoppingBag } from "lucide-react";
import { AdminTabbedSection } from "@/components/admin-tabbed-section";
import FavoritesStatistics from "@/views/statistics/FavoritesStatistics";
import SalesStatistics from "@/views/statistics/SalesStatistics";

const statisticTabs = [
	{
		id: "favorites",
		label: "Favoritos",
		title: "Favoritos",
		description: "Productos y clientes con mayor actividad de favoritos.",
		icon: Heart,
		content: <FavoritesStatistics />,
	},
	{
		id: "sales",
		label: "Ventas",
		title: "Ventas",
		description: "Pedidos completados, facturación y productos más vendidos.",
		icon: ShoppingBag,
		content: <SalesStatistics />,
	},
];

export default function Statistics() {
	return (
		<AdminTabbedSection
			title="Estadísticas"
			breadcrumbs={[{ label: "ESTADÍSTICAS" }]}
			tabs={statisticTabs}
			tabListLabel="Categorías de estadísticas"
		/>
	);
}
