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
import { RichTextPreview } from '@/components/rich-text-preview';

const priceModeScopeLabels = {
	both: 'Ambos',
	retail: 'Minorista',
	wholesale: 'Mayorista',
};

export default function PaymentMethodsList() {
	const navigate = useNavigate();
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [methodToDelete, setMethodToDelete] = useState(null);

	const {
		items: methods,
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
		endpoint: 'payment-methods',
		filterKeys: ['search'],
		defaultSort: { column: 'id', direction: 'desc' },
	});

	const columns = [
		{ key: 'id', label: 'ID', sortable: true, width: 'w-[60px]' },
		{ key: 'name', label: 'Nombre', sortable: true },
		{
			key: 'description',
			label: 'Descripción',
			sortable: false,
			render: (value) => <RichTextPreview html={value} />,
		},
		{
			key: 'status',
			label: 'Estado',
			sortable: true,
			render: (value) => (
				<span className={`px-2 py-1 rounded-full text-xs ${value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
					{value === 'active' ? 'Activo' : 'Inactivo'}
				</span>
			),
		},
		{
			key: 'price_mode_scope',
			label: 'Canal',
			sortable: false,
			render: (value) => (
				<span className="rounded-full bg-muted px-2 py-1 text-xs">
					{priceModeScopeLabels[value || 'both'] || 'Ambos'}
				</span>
			),
		},
		{
			key: 'fee',
			label: 'Porcentaje',
			sortable: true,
			render: (value) => `${parseFloat(value || 0).toFixed(2)}%`,
		},
		{ key: 'created_at', label: 'Creado', sortable: true, align: 'right', width: 'w-[130px]', format: 'date' },
	];

	const handleDeleteClick = (method) => {
		setMethodToDelete(method);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!methodToDelete) return;

		const success = await deleteItem(methodToDelete.id, {
			successMessage: 'Método eliminado correctamente',
			errorMessage: 'Error al eliminar el método',
		});

		if (success) {
			setDeleteDialogOpen(false);
			setMethodToDelete(null);
		}
	};

	const handleBulkDeleteClick = async () => {
		const success = await bulkDelete(selectedIds, {
			successMessage: 'Métodos eliminados exitosamente',
			errorMessage: 'Error al eliminar métodos',
		});

		if (success) {
			clearSelection();
		}
	};

	const renderActions = (method, isDropdown = false) => (
		<Can permission="users.view">
			{isDropdown ? (
				<>
					<DropdownMenuItem onClick={() => navigate(`/metodos-pago/editar/${method.id}`)}>
						<Edit className="mr-2 h-4 w-4" /> {'Editar'}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleDeleteClick(method)} className="text-red-500">
						<Trash2 className="mr-2 h-4 w-4" /> {'Eliminar'}
					</DropdownMenuItem>
				</>
			) : (
				<>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => navigate(`/metodos-pago/editar/${method.id}`)}
						title={`Editar método de pago ${method.name}`}
						aria-label={`Editar método de pago ${method.name}`}
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-red-500"
						onClick={() => handleDeleteClick(method)}
						title={`Eliminar método de pago ${method.name}`}
						aria-label={`Eliminar método de pago ${method.name}`}
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
				title={'Métodos de Pago'}
				breadcrumbs={[
					{ label: 'TIENDA' },
					{ label: 'Métodos de Pago' },
				]}
			/>

			<Card>
				<CardHeader className="flex flex-row items-center justify-start gap-2">
					<Can permission="users.view">
						<Button asChild>
							<Link to="/metodos-pago/crear">
								<Plus className="mr-2 h-4 w-4" /> {'Crear Método de Pago'}
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
									placeholder={'Buscar métodos de pago...'}
									className="pl-8"
									value={filters.search}
									onChange={(e) => setFilter('search', e.target.value)}
								/>
							</div>
							<CollapsibleTrigger asChild>
								<Button variant="outline" size="sm">
									<Filter className="mr-2 h-4 w-4" />
									{'Búsqueda avanzada'}
									<ChevronDown
										className={`ml-2 h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`}
									/>
								</Button>
							</CollapsibleTrigger>
						</div>

						<CollapsibleContent className="space-y-4">
							<div className="flex justify-end">
								<Button variant="ghost" size="sm" onClick={clearFilters}>
									<X className="mr-2 h-4 w-4" />
									{'Limpiar filtros'}
								</Button>
							</div>
						</CollapsibleContent>
					</Collapsible>

					<CrudTable
						items={methods}
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
						emptyMessage={'No se encontraron datos.'}
						loadingMessage={'Cargando...'}
					/>

					<CrudPagination
						meta={meta}
						page={page}
						onPageChange={setPage}
						prevLabel={'Anterior'}
						nextLabel={'Siguiente'}
					/>

					<ConfirmationDialog
						open={deleteDialogOpen}
						onOpenChange={setDeleteDialogOpen}
						title={'Confirmar eliminación'}
						description={'Esta acción no se puede deshacer.'}
						confirmText={'Confirmar'}
						cancelText={'Cancelar'}
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
