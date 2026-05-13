import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, DollarSign, Eye, Package, ReceiptText, ShoppingCart, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exportRowsToCsv, formatPercentChange } from "@/views/statistics/statistics-utils";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const emptySummary = {
	total_revenue: 0,
	orders_count: 0,
	average_order_value: 0,
	units_sold: 0,
};

const moneyFormatter = new Intl.NumberFormat("es-AR", {
	style: "currency",
	currency: "ARS",
	maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-AR");

const periods = [
	{ value: "7d", label: "7 días" },
	{ value: "30d", label: "30 días" },
	{ value: "90d", label: "90 días" },
	{ value: "all", label: "Todo" },
];

const metrics = [
	{
		key: "total_revenue",
		label: "Ventas totales",
		icon: DollarSign,
		format: (value) => moneyFormatter.format(value || 0),
	},
	{
		key: "orders_count",
		label: "Pedidos completados",
		icon: ReceiptText,
		format: (value) => numberFormatter.format(value || 0),
	},
	{
		key: "average_order_value",
		label: "Ticket promedio",
		icon: ShoppingCart,
		format: (value) => moneyFormatter.format(value || 0),
	},
	{
		key: "units_sold",
		label: "Unidades vendidas",
		icon: Package,
		format: (value) => numberFormatter.format(value || 0),
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

export default function SalesStatistics() {
	const [summary, setSummary] = useState(emptySummary);
	const [comparison, setComparison] = useState(null);
	const [products, setProducts] = useState([]);
	const [opportunities, setOpportunities] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [period, setPeriod] = useState("30d");
	const [categoryId, setCategoryId] = useState("all");

	useEffect(() => {
		const fetchSalesStatistics = async () => {
			setLoading(true);
			try {
				const response = await axiosClient.get("admin/statistics/sales", {
					params: {
						period,
						...(categoryId === "all" ? {} : { category_id: categoryId }),
					},
				});
				setSummary(response.data.data?.summary || emptySummary);
				setComparison(response.data.data?.comparison || null);
				setProducts(response.data.data?.products || []);
				setOpportunities(response.data.data?.opportunities || []);
				setCategories(response.data.data?.categories || []);
			} catch {
				toast.error("Error al cargar estadísticas de ventas");
			} finally {
				setLoading(false);
			}
		};

		fetchSalesStatistics();
	}, [period, categoryId]);

	const handleExport = () => {
		exportRowsToCsv("estadisticas-ventas.csv", products, [
			{ label: "Producto", value: (product) => product.name },
			{ label: "Categoría", value: (product) => product.category || "Sin categoría" },
			{ label: "Unidades", value: (product) => product.units_sold },
			{ label: "Ingresos", value: (product) => product.revenue },
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
				<div className="flex flex-wrap items-center gap-2">
					{periods.map((option) => (
						<Button
							key={option.value}
							type="button"
							variant={period === option.value ? "default" : "outline"}
							size="sm"
							onClick={() => setPeriod(option.value)}
						>
							{option.label}
						</Button>
					))}
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<select
						value={categoryId}
						onChange={(event) => setCategoryId(event.target.value)}
						className="h-9 rounded-md border bg-background px-3 text-sm"
						aria-label="Filtrar ventas por categoría"
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
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{metrics.map((metric) => {
					const MetricIcon = metric.icon;

					return (
						<div key={metric.key} className="rounded-lg border bg-muted/20 p-4">
							<div className="flex items-center justify-between gap-3">
								<p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
								<MetricIcon className="h-4 w-4 text-primary" />
							</div>
							<p className="mt-3 text-3xl font-bold tracking-tight">
								{metric.format(summary[metric.key])}
							</p>
							{comparison && (
								<p className="mt-2 text-xs text-muted-foreground">
									{formatPercentChange(comparison[metric.key])} vs período anterior
								</p>
							)}
						</div>
					);
				})}
			</div>

			{opportunities.length > 0 && (
				<div className="space-y-3">
					<div>
						<h3 className="text-lg font-semibold tracking-tight">Oportunidades</h3>
						<p className="text-sm text-muted-foreground">
							Productos con buenas ventas y stock bajo.
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
									<span>{product.units_sold} unidades</span>
									<span className="font-semibold">Stock {product.stock_total}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="space-y-3">
				<div>
					<h3 className="text-lg font-semibold tracking-tight">Productos más vendidos</h3>
					<p className="text-sm text-muted-foreground">
						Ranking basado únicamente en pedidos completados del período seleccionado.
					</p>
				</div>

				{products.length > 0 ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Producto</TableHead>
								<TableHead>Categoría</TableHead>
								<TableHead className="text-right">Unidades</TableHead>
								<TableHead className="text-right">Ingresos</TableHead>
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
									<TableCell className="text-right font-semibold">{product.units_sold}</TableCell>
									<TableCell className="text-right">{moneyFormatter.format(product.revenue || 0)}</TableCell>
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
						<span>Todavía no hay ventas completadas para mostrar en este período.</span>
						<Button type="button" variant="outline" size="sm" onClick={() => setPeriod("all")}>
							Ver todo
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
