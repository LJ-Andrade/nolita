import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, PlusCircle, Ticket, User, Layers, Palette, Ruler } from "lucide-react";

const orderStatusLabels = {
	pending: 'Pendiente',
	processing: 'Procesando',
	completed: 'Completada',
	cancelled: 'Cancelada',
};

const formatOrderTotal = (amount, currency) => {
	const numericAmount = Number(amount || 0);
	return `$${numericAmount.toFixed(2)} ${currency || ''}`.trim();
};

const formatOrderDate = (value) => {
	if (!value) return '';

	return new Date(value).toLocaleDateString('es-AR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
};

const OrderListCard = ({ title, description, items, emptyMessage }) => (
	<Card>
		<CardHeader className="space-y-1">
			<CardTitle className="text-base">{title}</CardTitle>
			<p className="text-sm text-muted-foreground">{description}</p>
		</CardHeader>
		<CardContent>
			{items.length === 0 ? (
				<p className="text-sm text-muted-foreground">{emptyMessage}</p>
			) : (
				<div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
					{items.map((order) => (
						<Link
							key={order.id}
							to={`/pedidos/${order.id}`}
							className="flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
						>
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<span className="font-medium">#{order.id}</span>
									<Badge variant="outline">{orderStatusLabels[order.status] || order.status}</Badge>
								</div>
								<p className="text-sm font-medium">{order.customer_name}</p>
								{order.customer_email && (
									<p className="text-sm text-muted-foreground">{order.customer_email}</p>
								)}
								<p className="text-xs text-muted-foreground">{formatOrderDate(order.created_at)}</p>
							</div>
							<div className="flex items-center gap-3 text-right">
								<div>
									<p className="font-medium">{formatOrderTotal(order.total_amount, order.currency)}</p>
									<p className="text-xs text-muted-foreground">Ver pedido</p>
								</div>
								<ArrowRight className="mt-1 h-4 w-4 text-muted-foreground" />
							</div>
						</Link>
					))}
				</div>
			)}
		</CardContent>
	</Card>
);

export default function Home() {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboard = async () => {
			try {
				const { data } = await axiosClient.get("dashboard");
				setData(data);
			} catch (err) {
				console.error("Dashboard fetch error:", err);
				if (err.response?.status === 403) {
					window.location.href = '/vadmin/login';
				}
			} finally {
				setLoading(false);
			}
		};

		fetchDashboard();
	}, []);

	if (loading) return (
		<div className="flex items-center justify-center h-[60vh]">
			<div className="relative">
				<div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
				<div className="absolute inset-0 h-12 w-12 rounded-full border-t-2 border-b-2 border-primary animate-pulse opacity-50"></div>
			</div>
		</div>
	);

	const pendingOrders = data?.pending_orders || [];
	return (
		<div className="space-y-8 animate-in fade-in duration-700">
			<div className="flex flex-col gap-2">
				<h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
					{"Bienvenido de nuevo"}
				</h1>
				<p className="text-lg text-muted-foreground">{"Hoy el foco está en pedidos por resolver."}</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{"Usuario Activo"}</CardTitle>
						<User className="h-5 w-5 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data?.user?.name}
						</div>
						<p className="mt-1 text-sm text-muted-foreground">{data?.user?.email}</p>
						{data?.user?.roles?.length > 0 && (
							<p className="mt-1 text-sm text-muted-foreground">
								{data.user.roles.map((role) => role.name).join(', ')}
							</p>
						)}
					</CardContent>
				</Card>

				<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-lg">
						<PlusCircle className="h-5 w-5" />
						Acciones Rápidas
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
						<Link to="/productos-categorias/crear" className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50">
							<Layers className="h-4 w-4 shrink-0 text-primary" />
							<span>{"Crear Categoría"}</span>
						</Link>
						<Link to="/productos-talles/crear" className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50">
							<Ruler className="h-4 w-4 shrink-0 text-primary" />
							<span>{"Crear Talle"}</span>
						</Link>
						<Link to="/productos-colores/crear" className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50">
							<Palette className="h-4 w-4 shrink-0 text-primary" />
							<span>{"Crear Color"}</span>
						</Link>
						<Link to="/cupones/crear" className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50">
							<Ticket className="h-4 w-4 shrink-0 text-primary" />
							<span>{"Crear Cupón"}</span>
						</Link>
					</div>
				</CardContent>
			</Card>

			</div>

			<div className="grid gap-6">
				<OrderListCard
					title="Pedidos nuevos pendientes"
					description="Lista rápida de pedidos que todavía esperan gestión."
					items={pendingOrders}
					emptyMessage="No hay pedidos pendientes en este momento."
				/>
			</div>
		</div>
	);
}
