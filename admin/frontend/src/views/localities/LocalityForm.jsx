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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function LocalityForm() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [provinces, setProvinces] = useState([]);
	const [loadingProvinces, setLoadingProvinces] = useState(false);

	const formSchema = z.object({
		name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
		province_id: z.string().min(1, "Debe seleccionar una provincia."),
		cost: z.string().optional().or(z.literal("")),
	});

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			province_id: "",
			cost: "",
		},
	});

	useEffect(() => {
		setLoadingProvinces(true);
		axiosClient.get("admin/provinces?all=1")
			.then(({ data }) => {
				setProvinces(data.data || data);
				setLoadingProvinces(false);
			})
			.catch(() => setLoadingProvinces(false));

		if (id) {
			setFetching(true);
			axiosClient
				.get(`admin/localities/${id}`)
				.then(({ data }) => {
					form.reset({
						name: data.data.name || "",
						province_id: String(data.data.province_id) || "",
						cost: data.data.cost || "",
					});
					setFetching(false);
				})
				.catch(() => {
					setFetching(false);
					toast.error("Error al cargar la localidad");
				});
		}
	}, [id, form]);

	const onSubmit = (values) => {
		setLoading(true);
		const payload = {
			name: values.name,
			province_id: values.province_id,
		};
		if (values.cost === "") {
			payload.cost = null;
		} else if (values.cost) {
			payload.cost = parseFloat(values.cost);
		}
		const request = id
			? axiosClient.put(`admin/localities/${id}`, payload)
			: axiosClient.post("admin/localities", payload);

		request
			.then(() => {
				toast.success(id ? "Localidad actualizada correctamente" : "Localidad creada correctamente");
				navigate("/localidades");
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

	const title = id ? `Editando localidad` : "Nueva Localidad";

	return (
		<div className="space-y-6 max-w-2xl">
			<PageHeader
				title={title}
				breadcrumbs={[
					{ label: 'SISTEMA', href: '/localidades' },
					{ label: "Localidades", href: '/localidades' },
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
									name="province_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{"Provincia"}</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value || ""}
												disabled={loadingProvinces}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Seleccionar provincia" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{provinces.map((prov) => (
														<SelectItem key={prov.id} value={String(prov.id)}>
															{prov.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{"Nombre"}</FormLabel>
											<FormControl>
												<Input placeholder="Nombre de la localidad" {...field} />
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
													placeholder="Costo de envío adicional (opcional)" 
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
										onClick={() => navigate("/localidades")}
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