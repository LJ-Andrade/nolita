import { UserPlus, Users } from "lucide-react";
import { AdminTabbedSection } from "@/components/admin-tabbed-section";
import GuestCustomersTab from "@/views/customers/GuestCustomersTab";
import RegisteredCustomersTab from "@/views/customers/RegisteredCustomersTab";

const customerTabs = [
	{
		id: "guests",
		label: "Invitados",
		title: "Clientes invitados",
		description: "Compradores anónimos provenientes de pedidos sin registro.",
		icon: UserPlus,
		content: <GuestCustomersTab />,
	},
	{
		id: "registered",
		label: "Registrados",
		title: "Clientes registrados",
		description: "Clientes con cuenta en la tienda.",
		icon: Users,
		content: <RegisteredCustomersTab />,
	},
];

export default function CustomersList() {
	return (
		<AdminTabbedSection
			title="Clientes"
			breadcrumbs={[{ label: "CLIENTES" }]}
			tabs={customerTabs}
			tabListLabel="Categorías de clientes"
		/>
	);
}
