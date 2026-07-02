import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";

const EMPTY_CONFIG = {
	is_enabled: true,
	delay_seconds: 3,
	title: "",
	subtitle: "",
	name_label: "",
	name_placeholder: "",
	email_label: "",
	email_placeholder: "",
	customer_type_text: "",
	submit_text: "",
	dismiss_text: "",
};

export default function PopupConfigModal({ open, onOpenChange }) {
	const [config, setConfig] = useState(EMPTY_CONFIG);
	const [fetching, setFetching] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!open) return;
		setFetching(true);
		axiosClient
			.get("newsletter-popup-config")
			.then(({ data }) => {
				setConfig({ ...EMPTY_CONFIG, ...(data.data || {}) });
			})
			.catch((error) => {
				toast.error("Error al cargar la configuración");
				console.error(error);
			})
			.finally(() => setFetching(false));
	}, [open]);

	const setField = (field, value) => {
		setConfig((prev) => ({ ...prev, [field]: value }));
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			await axiosClient.put("newsletter-popup-config", {
				is_enabled: config.is_enabled,
				delay_seconds: parseInt(config.delay_seconds, 10) || 0,
				title: config.title,
				subtitle: config.subtitle,
				name_label: config.name_label,
				name_placeholder: config.name_placeholder,
				email_label: config.email_label,
				email_placeholder: config.email_placeholder,
				customer_type_text: config.customer_type_text,
				submit_text: config.submit_text,
				dismiss_text: config.dismiss_text,
			});
			toast.success("Popup actualizado correctamente");
			onOpenChange(false);
		} catch (error) {
			toast.error("Error al guardar la configuración");
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{"Personalizar popup"}</DialogTitle>
					<DialogDescription>
						{"Configura el contenido y el comportamiento del popup de suscripciones."}
					</DialogDescription>
				</DialogHeader>

				{fetching ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin" />
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-center justify-between rounded-lg border p-3">
							<div className="space-y-0.5">
								<Label>{"Popup activo"}</Label>
								<p className="text-xs text-muted-foreground">
									{"Muestra u oculta el popup en toda la web."}
								</p>
							</div>
							<Switch
								checked={config.is_enabled}
								onCheckedChange={(v) => setField("is_enabled", v)}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="delay_seconds">{"Segundos de retraso"}</Label>
								<span className="text-sm font-medium text-muted-foreground">
									{config.delay_seconds}s
								</span>
							</div>
							<input
								id="delay_seconds"
								type="range"
								min={0}
								max={30}
								step={1}
								value={config.delay_seconds}
								onChange={(e) =>
									setField("delay_seconds", Number(e.target.value))
								}
								className="w-full cursor-pointer accent-primary"
							/>
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>{"0s"}</span>
								<span>{"30s"}</span>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="title">{"Título"}</Label>
							<Input
								id="title"
								value={config.title ?? ""}
								onChange={(e) => setField("title", e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="subtitle">{"Subtítulo"}</Label>
							<Textarea
								id="subtitle"
								rows={3}
								value={config.subtitle ?? ""}
								onChange={(e) => setField("subtitle", e.target.value)}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name_label">{"Etiqueta campo Nombre"}</Label>
								<Input
									id="name_label"
									value={config.name_label ?? ""}
									onChange={(e) => setField("name_label", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="name_placeholder">{"Placeholder Nombre"}</Label>
								<Input
									id="name_placeholder"
									value={config.name_placeholder ?? ""}
									onChange={(e) => setField("name_placeholder", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email_label">{"Etiqueta campo Email"}</Label>
								<Input
									id="email_label"
									value={config.email_label ?? ""}
									onChange={(e) => setField("email_label", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email_placeholder">{"Placeholder Email"}</Label>
								<Input
									id="email_placeholder"
									value={config.email_placeholder ?? ""}
									onChange={(e) => setField("email_placeholder", e.target.value)}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="customer_type_text">
								{"Texto Minorista/Mayorista"}
							</Label>
							<Textarea
								id="customer_type_text"
								rows={2}
								value={config.customer_type_text ?? ""}
								onChange={(e) => setField("customer_type_text", e.target.value)}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="submit_text">{"Texto del botón"}</Label>
								<Input
									id="submit_text"
									value={config.submit_text ?? ""}
									onChange={(e) => setField("submit_text", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="dismiss_text">{"Texto 'No mostrar más'"}</Label>
								<Input
									id="dismiss_text"
									value={config.dismiss_text ?? ""}
									onChange={(e) => setField("dismiss_text", e.target.value)}
								/>
							</div>
						</div>
					</div>
				)}

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={saving}
					>
						{"Cancelar"}
					</Button>
					<Button onClick={handleSave} disabled={saving || fetching}>
						{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						<Save className="mr-2 h-4 w-4" />
						{"Guardar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
