import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Settings2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Can from "@/components/can";
import { useCrudList } from "@/hooks/use-crud-list";
import { CrudTable } from "@/components/crud-table";
import { CrudPagination } from "@/components/crud-pagination";
import { BulkActionsBar } from "@/components/bulk-actions-bar";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { PageHeader } from "@/components/page-header";
import PopupConfigModal from "./PopupConfigModal";
import SubscriberFormModal from "./SubscriberFormModal";

export default function NewsletterSubscribers() {
	const [configOpen, setConfigOpen] = useState(false);
	const [formOpen, setFormOpen] = useState(false);
	const [editingSubscriber, setEditingSubscriber] = useState(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [subscriberToDelete, setSubscriberToDelete] = useState(null);

	const {
		items: subscribers,
		loading,
		meta,
		page,
		setPage,
		filters,
		setFilter,
		sortBy,
		sortDir,
		handleSort,
		deleteItem,
		bulkDelete,
		fetchItems,
		selectedIds,
		selectedCount,
		isAllSelected,
		toggleSelect,
		toggleSelectAll,
		clearSelection,
	} = useCrudList({
		endpoint: "newsletter-subscribers",
		filterKeys: ["search"],
		defaultSort: { column: "id", direction: "desc" },
	});

	const openCreate = () => {
		setEditingSubscriber(null);
		setFormOpen(true);
	};

	const openEdit = (subscriber) => {
		setEditingSubscriber(subscriber);
		setFormOpen(true);
	};

	const handleDeleteClick = (subscriber) => {
		setSubscriberToDelete(subscriber);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!subscriberToDelete) return;
		const success = await deleteItem(subscriberToDelete.id, {
			successMessage: "Suscriptor eliminado correctamente",
			errorMessage: "Error al eliminar el suscriptor",
		});
		if (success) {
			setDeleteDialogOpen(false);
			setSubscriberToDelete(null);
		}
	};

	const handleBulkDeleteClick = async () => {
		const success = await bulkDelete(selectedIds, {
			successMessage: "Elementos eliminados exitosamente",
			errorMessage: "Error al eliminar elementos",
		});
		if (success) {
			clearSelection();
		}
	};

	const renderCustomerType = (value) => {
		if (value === "mayorista")
			return <Badge className="bg-purple-500">{"Mayorista"}</Badge>;
		if (value === "minorista")
			return <Badge className="bg-blue-500">{"Minorista"}</Badge>;
		return <Badge variant="outline">{"Sin especificar"}</Badge>;
	};

	const columns = [
		{ key: "id", label: "ID", sortable: true, width: "w-[60px]" },
		{ key: "name", label: "Nombre", sortable: true },
		{ key: "email", label: "Email", sortable: true },
		{
			key: "customer_type",
			label: "Tipo",
			sortable: true,
			render: (value) => renderCustomerType(value),
		},
		{
			key: "created_at",
			label: "Fecha",
			sortable: true,
			align: "right",
			width: "w-[130px]",
			format: "date",
		},
	];

	const renderActions = (subscriber, isDropdown = false) => (
		<Can permission="users.view">
			{isDropdown ? (
				<>
					<DropdownMenuItem onClick={() => openEdit(subscriber)}>
						<Edit className="mr-2 h-4 w-4" /> {"Editar"}
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => handleDeleteClick(subscriber)}
						className="text-red-500"
					>
						<Trash2 className="mr-2 h-4 w-4" /> {"Eliminar"}
					</DropdownMenuItem>
				</>
			) : (
				<>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => openEdit(subscriber)}
						title={`Editar suscriptor ${subscriber.name}`}
						aria-label={`Editar suscriptor ${subscriber.name}`}
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-red-500"
						onClick={() => handleDeleteClick(subscriber)}
						title={`Eliminar suscriptor ${subscriber.name}`}
						aria-label={`Eliminar suscriptor ${subscriber.name}`}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</>
			)}
		</Can>
	);

	return (
		<div className="space-y-6">
			<PageHeader
				title={"Suscripciones"}
				breadcrumbs={[{ label: "SITIO" }, { label: "Suscripciones" }]}
			/>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between gap-2">
					<Can permission="users.view">
						<Button onClick={openCreate}>
							<Plus className="mr-2 h-4 w-4" /> {"Crear suscriptor"}
						</Button>
					</Can>
					<Can permission="users.view">
						<Button variant="outline" onClick={() => setConfigOpen(true)}>
							<Settings2 className="mr-2 h-4 w-4" /> {"Personalizar popup"}
						</Button>
					</Can>
				</CardHeader>

				<CardContent>
					<div className="flex items-center justify-between gap-4 pb-4">
						<div className="relative w-full max-w-sm">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder={"Buscar por nombre o email..."}
								className="pl-8"
								value={filters.search}
								onChange={(e) => setFilter("search", e.target.value)}
							/>
						</div>
					</div>

					<CrudTable
						items={subscribers}
						columns={columns}
						loading={loading}
						selectable={true}
						selectedIds={selectedIds}
						isAllSelected={isAllSelected}
						onSelectt={toggleSelect}
						onSelecttAll={toggleSelectAll}
						sortBy={sortBy}
						sortDir={sortDir}
						onSortt={handleSort}
						actions={renderActions}
						emptyMessage={"No se encontraron datos."}
						loadingMessage={"Cargando..."}
					/>

					<CrudPagination
						meta={meta}
						page={page}
						onPageChange={setPage}
						prevLabel={"Anterior"}
						nextLabel={"Siguiente"}
					/>

					<ConfirmationDialog
						open={deleteDialogOpen}
						onOpenChange={setDeleteDialogOpen}
						title={"Confirmar eliminación"}
						description={"Esta acción no se puede deshacer."}
						confirmText={"Confirmar"}
						cancelText={"Cancelar"}
						onConfirm={handleConfirmDelete}
					/>
				</CardContent>

				<BulkActionsBar
					selectedCount={selectedCount}
					onDelete={handleBulkDeleteClick}
					onClear={clearSelection}
				/>
			</Card>

			<PopupConfigModal open={configOpen} onOpenChange={setConfigOpen} />
			<SubscriberFormModal
				open={formOpen}
				onOpenChange={setFormOpen}
				subscriber={editingSubscriber}
				onSaved={() => fetchItems()}
			/>
		</div>
	);
}
