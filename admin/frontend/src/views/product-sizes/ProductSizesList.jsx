import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
	Plus,
	Edit,
	Trash2,
	Search,
	Filter,
	X,
	ChevronDown,
} from 'lucide-react';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
	DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import Can from '@/components/can';
import { useCrudList } from '@/hooks/use-crud-list';
import { CrudTable } from '@/components/crud-table';
import { CrudPagination } from '@/components/crud-pagination';
import { BulkActionsBar } from '@/components/bulk-actions-bar';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { PageHeader } from '@/components/page-header';

export default function ProductSizesList() {
	const navigate = useNavigate();
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [sizeToDelete, setSizeToDelete] = useState(null);

	const {
		items: sizes,
		loading,
		meta,
		page,
		setPage,
		filters,
		setFilter,
		clearFilters,
		sortBy,
		sortDir,
		handleSort,
		deleteItem,
		bulkDelete,
		selectedIds,
		selectedCount,
		isAllSelected,
		toggleSelect,
		toggleSelectAll,
		clearSelection,
	} = useCrudList({
		endpoint: 'product-sizes',
		filterKeys: ['search', 'filter_id', 'filter_name'],
		defaultSort: { column: 'id', direction: 'desc' },
	});

	const columns = [
		{ key: 'id', label: "ID" || 'ID', sortable: true, width: 'w-[60px]' },
		{ key: 'name', label: "Nombre" || 'Nombre', sortable: true },
		{ key: 'created_at', label: "Creado el" || 'Creado', sortable: true, align: 'right', width: 'w-[130px]', format: 'date' },
	];

	const handleDeleteClick = (size) => {
		setSizeToDelete(size);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!sizeToDelete) return;

		const success = await deleteItem(sizeToDelete.id, {
			successMessage: "Talle eliminado correctamente" || 'Talla eliminada correctamente',
			errorMessage: "Error al eliminar la talla" || 'Error al eliminar la talla',
		});

		if (success) {
			setDeleteDialogOpen(false);
			setSizeToDelete(null);
		}
	};

	const handleBulkDeleteClick = async () => {
		const success = await bulkDelete(selectedIds, {
			successMessage: "Elementos eliminados exitosamente",
			errorMessage: "Error al eliminar elementos",
		});

		if (success) clearSelection();
	};

	const renderActions = (size, isDropdown = false) => (
		<Can permission="manage product sizes">
			{isDropdown ? (
				<>
					<DropdownMenuItem onClick={() => navigate(`/productos-talles/editar/${size.id}`)}>
						<Edit className="mr-2 h-4 w-4" /> {"Editar"}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleDeleteClick(size)} className="text-red-500">
						<Trash2 className="mr-2 h-4 w-4" /> {"Eliminar"}
					</DropdownMenuItem>
				</>
			) : (
				<>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => navigate(`/productos-talles/editar/${size.id}`)}
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-red-500"
						onClick={() => handleDeleteClick(size)}
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
				title={"Talles"}
				breadcrumbs={[
					{ label: 'TIENDA' },
					{ label: "Talles" },
				]}
			/>

			<Card>
				<CardHeader className="flex flex-row items-center justify-start gap-2">
					<Can permission="manage product sizes">
						<Button asChild>
							<Link to="/productos-talles/crear">
								<Plus className="mr-2 h-4 w-4" /> {"Crear Talla"}
							</Link>
						</Button>
					</Can>
				</CardHeader>

				<CardContent>
					<Collapsible
						open={isFiltersOpen}
						onOpenChange={setIsFiltersOpen}
						className="space-y-4 pb-4"
					>
						<div className="flex items-center justify-between gap-4">
							<div className="relative w-full max-w-sm">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder={"Buscar talles..."}
									className="pl-8"
									value={filters.search}
									onChange={(e) => setFilter('search', e.target.value)}
								/>
							</div>
							<CollapsibleTrigger asChild>
								<Button variant="outline" size="sm">
									<Filter className="mr-2 h-4 w-4" />
									{"Búsqueda avanzada"}
									<ChevronDown
										className={`ml-2 h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''
											}`}
									/>
								</Button>
							</CollapsibleTrigger>
						</div>

						<CollapsibleContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
								<div className="space-y-2">
									<label htmlFor="filterId" className="text-sm font-medium">
										{"ID"}
									</label>
									<Input
										id="filterId"
										placeholder={"ID"}
										value={filters.filter_id}
										onChange={(e) => setFilter('filter_id', e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<label htmlFor="filterName" className="text-sm font-medium">
										{"Nombre"}
									</label>
									<Input
										id="filterName"
										placeholder={"Nombre"}
										value={filters.filter_name}
										onChange={(e) => setFilter('filter_name', e.target.value)}
									/>
								</div>
							</div>
							<div className="flex justify-end">
								<Button variant="ghost" size="sm" onClick={clearFilters}>
									<X className="mr-2 h-4 w-4" />
									{"Limpiar filtros"}
								</Button>
							</div>
						</CollapsibleContent>
					</Collapsible>

					<CrudTable
						items={sizes}
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
		</div>
	);
}
