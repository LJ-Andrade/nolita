import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Save, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function ProvinceForm() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);

	const formSchema = z.object({
		name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
		code: z.string().optional().or(z.literal("")),
		cost: z.string().optional().or(z.literal("")),
	});

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			code: "",
			cost: "",
		},
	});

	useEffect(() => {
		if (id) {
			setFetching(true);
			axiosClient
				.get(`admin/provinces/${id}`)
				.then(({ data }) => {
					form.reset({
						name: data.data.name || "",
						code: data.data.code || "",
						cost: data.data.cost || "",
					});
					setFetching(false);
				})
				.catch(() => {
					setFetching(false);
					toast.error("Error al cargar la provincia");
				});
		}
	}, [id, form]);

	const onSubmit = (values) => {
		setLoading(true);
		const payload = { ...values };
		if (payload.cost === "") {
			payload.cost = null;
		} else if (payload.cost) {
			payload.cost = parseFloat(payload.cost);
		}
		const request = id
			? axiosClient.put(`admin/provinces/${id}`, payload)
			: axiosClient.post("admin/provinces", payload);

		request
			.then(() => {
				toast.success(id ? "Provincia actualizada correctamente" : "Provincia creada correctamente");
				navigate("/provincias");
			})
			.catch((error) => {
				if (error.response && error.response.status === 422) {
					const errors = error.response.data.errors;
					Object.keys(errors).forEach((key) => {
						form.setError(key, {
							type: "manual",
							message: errors[key][0],
						});
					});
				} else {
					toast.error(error.response?.data?.message || "Ocurrió un error");
				}
				setLoading(false);
			});
	};

	const title = id ? `Editando provincia` : "Nueva Provincia";

	return (
		<div className="space-y-6 max-w-2xl">
			<PageHeader
				title={title}
				breadcrumbs={[
					{ label: 'SISTEMA', href: '/provincias' },
					{ label: "Provincias", href: '/provincias' },
					{ label: id ? "Editar" : "Crear" },
				]}
			/>

			<Card>
				<CardHeader>
					<CardTitle>{title}</CardTitle>
				</CardHeader>
				<CardContent>
					{fetching ? (
						<div className="flex justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					) : (
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{"Nombre"}</FormLabel>
											<FormControl>
												<Input placeholder="Nombre de la provincia" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="code"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{"Código ISO"}</FormLabel>
											<FormControl>
												<Input placeholder="Código ISO (ej: AR-B)" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="cost"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{"Costo de Envío"}</FormLabel>
											<FormControl>
												<Input 
													type="number" 
													step="0.01" 
													min="0" 
													placeholder="Costo de envío (opcional)" 
													{...field} 
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="flex justify-end space-x-2 pt-6 border-t">
									<Button
										type="button"
										variant="outline"
										onClick={() => navigate("/provincias")}
									>
										<X className="mr-2 h-4 w-4" />
										{"Cancelar"}
									</Button>
									<Button type="submit" disabled={loading}>
										{loading ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : id ? (
											<Save className="mr-2 h-4 w-4" />
										) : (
											<Plus className="mr-2 h-4 w-4" />
										)}
										{id ? "Actualizar" : "Crear"}
									</Button>
								</div>
							</form>
						</Form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}