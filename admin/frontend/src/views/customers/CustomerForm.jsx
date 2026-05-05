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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/page-header";

export default function CustomerForm() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [avatarUrl, setAvatarUrl] = useState(null);
	const [pendingAvatar, setPendingAvatar] = useState(null);
	const [provinces, setProvinces] = useState([]);
	const [localities, setLocalities] = useState([]);
	const [loadingProvinces, setLoadingProvinces] = useState(false);
	const [loadingLocalities, setLoadingLocalities] = useState(false);
	const [selectedProvinceId, setSelectedProvinceId] = useState("");
	const [selectedLocalityId, setSelectedLocalityId] = useState("");

	const formSchema = z.object({
		name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
		dni: z.string()
			.length(8, "El DNI debe tener exactamente 8 dígitos.")
			.regex(/^[0-9]+$/, "El DNI debe contener solo números.")
			.optional()
			.or(z.literal("")),
		email: z.string().email("Correo electrónico no válido."),
		password: id
			? z.string().optional().or(z.literal(""))
			: z.string().min(8, "Password must be at least 8 characters."),
		phone: z.string().optional().or(z.literal("")),
		address: z.string().optional().or(z.literal("")),
		postal_code: z.string().max(20, "El CP no puede superar 20 caracteres.").optional().or(z.literal("")),
		is_active: z.boolean().default(true),
		province_id: z.string().optional().or(z.literal("")),
		locality_id: z.string().optional().or(z.literal("")),
	});

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			dni: "",
			email: "",
			password: "",
			phone: "",
			address: "",
			postal_code: "",
			is_active: true,
			province_id: "",
			locality_id: "",
		},
	});

	useEffect(() => {
		setLoadingProvinces(true);
		axiosClient.get('/admin/provinces')
			.then(({ data }) => {
				const provincesData = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
				setProvinces(provincesData);
				setLoadingProvinces(false);
			})
			.catch(() => setLoadingProvinces(false));
	}, []);

	useEffect(() => {
		if (id) {
			setFetching(true);
			axiosClient
				.get(`admin/customers/${id}`)
				.then(({ data }) => {
					const customerData = data.data;
					form.reset({
						name: customerData.name || "",
						dni: customerData.dni || "",
						email: customerData.email || "",
						password: "",
						phone: customerData.phone || "",
						address: customerData.address || "",
						postal_code: customerData.postal_code || "",
						is_active: !!customerData.is_active,
						province_id: "",
						locality_id: "",
					});
					setAvatarUrl(customerData.avatar_url);
					setFetching(false);
					if (customerData.province_id) {
						const provIdStr = String(customerData.province_id);
						const locIdStr = customerData.locality_id ? String(customerData.locality_id) : "";
						setSelectedProvinceId(provIdStr);
						setSelectedLocalityId(locIdStr);
						loadLocalities(customerData.province_id);
					}
				})
				.catch(() => {
					setFetching(false);
					toast.error("Error al cargar el cliente");
				});
		}
	}, [id, form]);

	const handleAvatarChange = async (file) => {
		if (!id) {
			setPendingAvatar(file);
			setAvatarUrl(URL.createObjectURL(file));
			return;
		}

		const formData = new FormData();
		formData.append('avatar', file);

		try {
			const { data } = await axiosClient.post(`admin/customers/${id}/avatar`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			setAvatarUrl(`${data.data.avatar_url}?t=${new Date().getTime()}`);
			toast.success("Avatar actualizado correctamente");
		} catch (error) {
			console.error("Error uploading avatar:", error);
			toast.error("Error al actualizar el avatar");
		}
	};

	const loadLocalities = (provinceId) => {
		if (!provinceId) {
			setLocalities([]);
			setSelectedLocalityId("");
			return;
		}
		setLoadingLocalities(true);
		axiosClient.get('/admin/localities', { params: { province_id: provinceId } })
			.then(({ data }) => {
				const localitiesData = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
				setLocalities(localitiesData);
				setLoadingLocalities(false);
			})
			.catch(() => setLoadingLocalities(false));
	};

	const handleProvinceChange = (provinceId) => {
		setSelectedProvinceId(provinceId);
		setSelectedLocalityId("");
		form.setValue('province_id', provinceId);
		form.setValue('locality_id', '');
		loadLocalities(provinceId);
	};

	const onSubmit = (values) => {
		setLoading(true);
		const payload = { ...values };
		if (id && !payload.password) {
			delete payload.password;
		}
		
		if (selectedProvinceId) {
			payload.province_id = selectedProvinceId;
		}
		if (selectedLocalityId) {
			payload.locality_id = selectedLocalityId;
		}

		let request;
		if (!id && pendingAvatar) {
			const formData = new FormData();
			Object.keys(payload).forEach((key) => {
				if (payload[key] !== undefined && payload[key] !== null) {
					formData.append(key, payload[key] === true ? 1 : (payload[key] === false ? 0 : payload[key]));
				}
			});
			formData.append("avatar", pendingAvatar);
			request = axiosClient.post("admin/customers", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
		} else {
			request = id
				? axiosClient.put(`admin/customers/${id}`, payload)
				: axiosClient.post("admin/customers", payload);
		}

		request
			.then(() => {
				toast.success(id ? "Guardado correctamente" : "Cliente creado correctamente");
				navigate('/clientes');
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

	return (
		<div className="space-y-6">
			<PageHeader
				title={id ? "Editar Cliente" : "Nuevo Cliente"}
				breadcrumbs={[
					{ label: 'CLIENTES' },
					{ label: id ? "Editar" : "Crear" },
				]}
			/>
			<div className="max-w-2xl  pb-10">
				<Card>
					<CardHeader>
						<CardTitle>
							{id ? "Editar Cliente" : "Nuevo Cliente"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{fetching ? (
							<div className="flex justify-center py-8">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</div>
						) : (
							<div className="space-y-6">
								<div className="flex justify-center pb-6 border-b">
									<AvatarUpload
										value={avatarUrl}
										onChange={handleAvatarChange}
									/>
								</div>

								<Form {...form}>
									<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{"Nombre"}</FormLabel>
													<FormControl>
														<Input placeholder="John Doe" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="dni"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{"DNI"}</FormLabel>
													<FormControl>
														<Input placeholder="12345678" maxLength={8} {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FormField
												control={form.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{"Correo"}</FormLabel>
														<FormControl>
															<Input type="email" placeholder="john@example.com" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="password"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															{"Contraseña"} {id && "(dejar en blanco para mantener la actual)"}
														</FormLabel>
														<FormControl>
															<Input type="password" placeholder="********" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<FormField
											control={form.control}
											name="phone"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{"Teléfono"}</FormLabel>
													<FormControl>
														<Input placeholder="+1 234 567 890" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="address"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{"Dirección"}</FormLabel>
													<FormControl>
														<Textarea
															placeholder="Calle, Ciudad, País"
															className="resize-none"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="postal_code"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{"CP"}</FormLabel>
													<FormControl>
														<Input placeholder="1405" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<FormField
												control={form.control}
												name="province_id"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{"Provincia"}</FormLabel>
														<Select 
															onValueChange={(val) => {
																field.onChange(val);
																handleProvinceChange(val);
															}} 
															value={selectedProvinceId || field.value || ""}
														>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="Seleccionar provincia" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{loadingProvinces ? (
																	<SelectItem value="loading" disabled>Cargando...</SelectItem>
																) : provinces.length === 0 ? (
																	<SelectItem value="empty" disabled>No hay provincias</SelectItem>
																) : (
																	provinces.map((prov) => (
																		<SelectItem key={prov.id} value={String(prov.id)}>
																			{prov.name}
																		</SelectItem>
																	))
																)}
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="locality_id"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{"Localidad"}</FormLabel>
														<Select 
															onValueChange={field.onChange} 
															value={selectedLocalityId || field.value || ""}
															disabled={!selectedProvinceId || loadingLocalities}
														>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="Seleccionar localidad" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{loadingLocalities ? (
																	<SelectItem value="loading" disabled>Cargando...</SelectItem>
																) : localities.length === 0 ? (
																	<SelectItem value="empty" disabled>No hay localidades</SelectItem>
																) : (
																	localities.map((loc) => (
																		<SelectItem key={loc.id} value={String(loc.id)}>
																			{loc.name}
																		</SelectItem>
																	))
																)}
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<FormField
											control={form.control}
											name="is_active"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
													<div className="space-y-0.5">
														<FormLabel className="text-base">
															{"Estado Activo"}
														</FormLabel>
													</div>
													<FormControl>
														<Switch
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										<div className="flex justify-end space-x-2 pt-4">
											<Button
												type="button"
												variant="outline"
												onClick={() => navigate('/clientes')}
											>
												{"Cancelar"}
											</Button>
											<Button type="submit" disabled={loading}>
												{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
												{"Guardar"}
											</Button>
										</div>
									</form>
								</Form>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
