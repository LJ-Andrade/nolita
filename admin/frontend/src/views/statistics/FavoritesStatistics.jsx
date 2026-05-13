import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Eye, Heart, Package, TriangleAlert, Users } from "lucide-react";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exportRowsToCsv } from "@/views/statistics/statistics-utils";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const emptySummary = {
	total_favorites: 0,
	unique_products: 0,
	customers_with_favorites: 0,
};

const metrics = [
	{
		key: "total_favorites",
		label: "Favoritos totales",
		icon: Heart,
	},
	{
		key: "unique_products",
		label: "Productos favoritos",
		icon: Package,
	},
	{
		key: "customers_with_favorites",
		label: "Clientes con favoritos",
		icon: Users,
	},
];

function ProductStatusBadge({ status }) {
	if (status === "published") {
		return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Publicado</Badge>;
	}

	if (status === "draft") {
		return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Borrador</Badge>;
	}

	return <Badge variant="outline">{status || "Sin estado"}</Badge>;
}

export default function FavoritesStatistics() {
	const [summary, setSummary] = useState(emptySummary);
	const [products, setProducts] = useState([]);
	const [opportunities, setOpportunities] = useState([]);
	const [categories, setCategories] = useState([]);
	const [categoryId, setCategoryId] = useState("all");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchFavoritesStatistics = async () => {
			setLoading(true);
			try {
				const response = await axiosClient.get("admin/statistics/favorites", {
					params: categoryId === "all" ? {} : { category_id: categoryId },
				});
				setSummary(response.data.data?.summary || emptySummary);
				setProducts(response.data.data?.products || []);
				setOpportunities(response.data.data?.opportunities || []);
				setCategories(response.data.data?.categories || []);
			} catch {
				toast.error("Error al cargar estadísticas de favoritos");
			} finally {
				setLoading(false);
			}
		};

		fetchFavoritesStatistics();
	}, [categoryId]);

	const handleExport = () => {
		exportRowsToCsv("estadisticas-favoritos.csv", products, [
			{ label: "Producto", value: (product) => product.name },
			{ label: "Categoría", value: (product) => product.category || "Sin categoría" },
			{ label: "Favoritos", value: (product) => product.favorites_count },
			{ label: "Stock", value: (product) => product.stock_total },
			{ label: "Estado", value: (product) => product.status || "" },
		]);
	};

	if (loading) {
		return (
			<div className="flex min-h-56 items-center justify-center">
				<div className="h-10 w-10 rounded-full border-b-2 border-t-2 border-primary animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<select
					value={categoryId}
					onChange={(event) => setCategoryId(event.target.value)}
					className="h-9 rounded-md border bg-background px-3 text-sm"
					aria-label="Filtrar favoritos por categoría"
				>
					<option value="all">Todas las categorías</option>
					{categories.map((category) => (
						<option key={category.id} value={category.id}>
							{category.name}
						</option>
					))}
				</select>

				<Button type="button" variant="outline" size="sm" onClick={handleExport} disabled={products.length === 0}>
					<Download className="mr-2 h-4 w-4" />
					Exportar CSV
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{metrics.map((metric) => {
					const MetricIcon = metric.icon;

					return (
						<div key={metric.key} className="rounded-lg border bg-muted/20 p-4">
							<div className="flex items-center justify-between gap-3">
								<p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
								<MetricIcon className="h-4 w-4 text-primary" />
							</div>
							<p className="mt-3 text-3xl font-bold tracking-tight">
								{summary[metric.key] ?? 0}
							</p>
						</div>
					);
				})}
			</div>

			{opportunities.length > 0 && (
				<div className="space-y-3">
					<div>
						<h3 className="text-lg font-semibold tracking-tight">Oportunidades</h3>
						<p className="text-sm text-muted-foreground">
							Productos con muchos favoritos y stock bajo.
						</p>
					</div>
					<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
						{opportunities.map((product) => (
							<div key={product.id} className="rounded-lg border bg-yellow-500/5 p-4">
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="font-medium">{product.name}</p>
										<p className="text-sm text-muted-foreground">{product.category || "Sin categoría"}</p>
									</div>
									<TriangleAlert className="h-4 w-4 text-yellow-600" />
								</div>
								<div className="mt-4 flex items-center justify-between text-sm">
									<span>{product.favorites_count} favoritos</span>
									<span className="font-semibold">Stock {product.stock_total}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="space-y-3">
				<div>
					<h3 className="text-lg font-semibold tracking-tight">Productos más favoritos</h3>
					<p className="text-sm text-muted-foreground">
						Ranking de productos ordenados por cantidad de clientes que los guardaron.
					</p>
				</div>

				{products.length > 0 ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Producto</TableHead>
								<TableHead>Categoría</TableHead>
								<TableHead className="text-right">Favoritos</TableHead>
								<TableHead className="text-right">Stock</TableHead>
								<TableHead>Estado</TableHead>
								<TableHead className="text-right">Acción</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{products.map((product) => (
								<TableRow key={product.id}>
									<TableCell className="font-medium">{product.name}</TableCell>
									<TableCell>{product.category || "Sin categoría"}</TableCell>
									<TableCell className="text-right font-semibold">{product.favorites_count}</TableCell>
									<TableCell className="text-right">{product.stock_total}</TableCell>
									<TableCell>
										<ProductStatusBadge status={product.status} />
									</TableCell>
									<TableCell className="text-right">
										<Button asChild variant="ghost" size="sm">
											<Link to={`/productos/${product.id}`}>
												<Eye className="mr-2 h-4 w-4" />
												Ver
											</Link>
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
						<span>Todavía no hay productos favoritos para mostrar en este filtro.</span>
						<Button asChild variant="outline" size="sm">
							<Link to="/productos">Ver productos</Link>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
