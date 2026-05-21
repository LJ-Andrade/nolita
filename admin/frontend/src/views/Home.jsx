import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Users, FileText, PlusCircle, Tag, Layers, Ruler, Palette, Ticket } from "lucide-react";
export default function Home() {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	const getStatLabel = (key) => {
		const labels = {
			'total_users': "Total Usuarios",
			'total_posts': "Total Artículos",
		};
		return labels[key] || key;
	};

	const getIcon = (key) => {
		const k = key.toLowerCase();
		if (k.includes('users')) return <Users className="h-5 w-5 text-primary" />;
		if (k.includes('posts')) return <FileText className="h-5 w-5 text-primary" />;
		return <User className="h-5 w-5 text-primary" />;
	};

	useEffect(() => {
		const fetchDashboard = async () => {
			try {
				const { data } = await axiosClient.get("dashboard");
				setData(data);
			} catch (err) {
				console.error("Dashboard fetch error:", err);
				// If the error isn't handled by the global interceptor (e.g. 404 or other)
				// ensure we stop loading and perhaps show an error state if needed.
				if (err.response?.status === 403) {
					// Forbidden - maybe user lost permissions
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

	return (
		<div className="space-y-8 animate-in fade-in duration-700">
			<div className="flex flex-col gap-2">
				<h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
					{"Bienvenido de nuevo"}
				</h1>
				<p className="text-muted-foreground text-lg">{"Esto es lo que está pasando en tu sistema hoy."}</p>
			</div>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card className="premium-card group overflow-hidden relative">
					<div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{"Usuario Activo"}</CardTitle>
						<User className="h-5 w-5 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-primary drop-shadow-[0_0_8px_color-mix(in_srgb,var(--primary)_40%,transparent)]">
							{data?.user?.name}
						</div>
						<p className="text-sm text-muted-foreground/80 mt-1">{data?.user?.email}</p>
						{data?.user?.roles?.length > 0 && (
							<p className="text-sm text-muted-foreground/60 mt-1">
								{data.user.roles.map(r => r.name).join(', ')}
							</p>
						)}
					</CardContent>
				</Card>

				{data?.stats && Object.entries(data.stats).map(([key, value]) => (
					<Card key={key} className="premium-card group overflow-hidden relative">
						<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
								{getStatLabel(key)}
							</CardTitle>
							{getIcon(key)}
						</CardHeader>
						<CardContent>
							<div className="text-4xl font-black tracking-tighter drop-shadow-[0_0_10px_color-mix(in_srgb,var(--primary)_30%,transparent)]">
								{value}
							</div>
							<div className="h-1 w-12 bg-primary/40 rounded-full mt-4 group-hover:w-24 transition-all duration-500" />
						</CardContent>
					</Card>
				))}
			</div>

			<Card className="premium-card group overflow-hidden relative border-primary/20 bg-primary/5">
				<div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-50 transition-opacity duration-500 pointer-events-none" />
				<CardHeader className="pb-2">
					<CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2 text-primary">
						<PlusCircle className="h-5 w-5" />
						Acciones Rápidas
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
						<Link to="/productos-etiquetas/crear" className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/20 hover:border-primary/40 transition-all group/item">
							<Tag className="h-6 w-6 text-primary mb-2 group-hover/item:scale-110 transition-transform" />
							<span className="text-sm font-medium text-center">{"Crear Etiqueta"}</span>
						</Link>
						<Link to="/productos-categorias/crear" className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/20 hover:border-primary/40 transition-all group/item">
							<Layers className="h-6 w-6 text-primary mb-2 group-hover/item:scale-110 transition-transform" />
							<span className="text-sm font-medium text-center">{"Crear Categoría"}</span>
						</Link>
						<Link to="/productos-talles/crear" className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/20 hover:border-primary/40 transition-all group/item">
							<Ruler className="h-6 w-6 text-primary mb-2 group-hover/item:scale-110 transition-transform" />
							<span className="text-sm font-medium text-center">{"Crear Talle"}</span>
						</Link>
						<Link to="/productos-colores/crear" className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/20 hover:border-primary/40 transition-all group/item">
							<Palette className="h-6 w-6 text-primary mb-2 group-hover/item:scale-110 transition-transform" />
							<span className="text-sm font-medium text-center">{"Crear Color"}</span>
						</Link>
						<Link to="/cupones/crear" className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/20 hover:border-primary/40 transition-all group/item col-span-2 md:col-span-1 lg:col-span-1">
							<Ticket className="h-6 w-6 text-primary mb-2 group-hover/item:scale-110 transition-transform" />
							<span className="text-sm font-medium text-center">{"Crear Cupón"}</span>
						</Link>
					</div>
				</CardContent>
			</Card>


		</div>
	);
}
