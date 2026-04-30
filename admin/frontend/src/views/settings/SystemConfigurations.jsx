import { Settings2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function SystemConfigurations() {
	return (
		<div className="space-y-6">
			<PageHeader
				title={"Información de Negocio"}
				breadcrumbs={[
					{ label: 'CONFIGURACIÓN' },
					{ label: "Sistema" },
				]}
			/>


			<div className="flex items-center justify-center h-48 text-muted-foreground border border-dashed rounded-lg">
				{"No hay configuraciones disponibles en este momento."}
			</div>
		</div>
	);
}
