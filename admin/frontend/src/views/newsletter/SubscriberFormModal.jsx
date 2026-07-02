import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";

const EMPTY = {
	name: "",
	email: "",
	customer_type: "",
};

export default function SubscriberFormModal({ open, onOpenChange, subscriber, onSaved }) {
	const isEdit = Boolean(subscriber?.id);
	const [form, setForm] = useState(EMPTY);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!open) return;
		setForm(
			subscriber
				? {
						name: subscriber.name ?? "",
						email: subscriber.email ?? "",
						customer_type: subscriber.customer_type ?? "",
					}
				: EMPTY,
		);
	}, [open, subscriber]);

	const setField = (field, value) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const payload = {
				name: form.name,
				email: form.email,
				customer_type: form.customer_type || null,
			};

			if (isEdit) {
				await axiosClient.put(`newsletter-subscribers/${subscriber.id}`, payload);
				toast.success("Suscriptor actualizado correctamente");
			} else {
				await axiosClient.post("newsletter-subscribers", payload);
				toast.success("Suscriptor creado correctamente");
			}
			onSaved?.();
			onOpenChange(false);
		} catch (error) {
			const message =
				error?.response?.data?.errors?.email?.[0] ||
				"Error al guardar el suscriptor";
			toast.error(message);
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Editar suscriptor" : "Crear suscriptor"}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">{"Nombre"}</Label>
						<Input
							id="name"
							value={form.name}
							onChange={(e) => setField("name", e.target.value)}
							placeholder={"Nombre y apellido"}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">{"Email"}</Label>
						<Input
							id="email"
							type="email"
							value={form.email}
							onChange={(e) => setField("email", e.target.value)}
							placeholder={"correo@ejemplo.com"}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="customer_type">{"Tipo de cliente"}</Label>
						<Select
							value={form.customer_type || "none"}
							onValueChange={(v) =>
								setField("customer_type", v === "none" ? "" : v)
							}
						>
							<SelectTrigger id="customer_type">
								<SelectValue placeholder={"Sin especificar"} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">{"Sin especificar"}</SelectItem>
								<SelectItem value="minorista">{"Minorista"}</SelectItem>
								<SelectItem value="mayorista">{"Mayorista"}</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={saving}
					>
						{"Cancelar"}
					</Button>
					<Button onClick={handleSave} disabled={saving}>
						{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						<Save className="mr-2 h-4 w-4" />
						{isEdit ? "Guardar" : "Crear"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
