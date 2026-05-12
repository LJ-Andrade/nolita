import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axiosClient from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Plus,
	Edit,
	Trash2,
	Search,
	Filter,
	X,
	ChevronDown,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
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
import { CrudPagination } from '@/components/crud-pagination';
import { BulkActionsBar } from '@/components/bulk-actions-bar';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { PageHeader } from '@/components/page-header';
import { CrudInlineOrderEditor } from '@/components/crud-inline-order-editor';

export default function CategoriesList() {
	const navigate = useNavigate();
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState(null);

	const {
		items: categories,
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
		fetchItems,
		refresh,
	} = useCrudList({
		endpoint: 'product-categories',
		filterKeys: ['search', 'filter_id', 'filter_name'],
		defaultSort: { column: 'id', direction: 'desc' },
	});

	const getSortIcon = (column) => {
		if (sortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />;
		return sortDir === 'asc' ? (
			<ArrowUp className="ml-2 h-4 w-4" />
		) : (
			<ArrowDown className="ml-2 h-4 w-4" />
		);
	};

	const handleDeleteClick = (category) => {
		setCategoryToDelete(category);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!categoryToDelete) return;

		const success = await deleteItem(categoryToDelete.id, {
			successMessage: "Categoría eliminada correctamente",
			errorMessage: "Error al eliminar la categoría",
		});

		if (success) {
			setDeleteDialogOpen(false);
			setCategoryToDelete(null);
		}
	};

	const handleBulkDeleteClick = async () => {
		const success = await bulkDelete(selectedIds, {
			successMessage: "Elementos eliminados exitosamente",
			errorMessage: "Error al eliminar elementos",
		});

		if (success) clearSelection();
	};

	const saveCategoryOrder = async (category, order) => {
		await axiosClient.put(`product-categories/${category.id}`, {
			order,
			name: category.name,
			slug: category.slug,
			listed: category.listed,
		});
		refresh();
	};

	// Toggle listed
	const toggleListed = (category) => {
		axiosClient.put(`product-categories/${category.id}`, {
			listed: !category.listed,
			name: category.name,
			slug: category.slug,
			order: category.order,
		})
			.then(() => {
				refresh();
				toast.success(`Categoría "${category.name}" ${category.listed ? 'no se mostrará en la web' : 'se mostrará en la web'}	`);
			})
			.catch(() => {
				toast.error("Error al actualizar");
			});
	};

	const renderActions = (category, isDropdown = false) => (
		<Can permission="manage product categories">
			{isDropdown ? (
				<>
					<DropdownMenuItem onClick={() => navigate(`/productos-categorias/editar/${category.id}`)}>
						<Edit className="mr-2 h-4 w-4" /> {"Editar"}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleDeleteClick(category)} className="text-red-500">
						<Trash2 className="mr-2 h-4 w-4" /> {"Eliminar"}
					</DropdownMenuItem>
				</>
			) : (
				<>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => navigate(`/productos-categorias/editar/${category.id}`)}
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-red-500"
						onClick={() => handleDeleteClick(category)}
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
				title={"Categorías"}
				breadcrumbs={[
					{ label: 'TIENDA' },
					{ label: "Categorías" },
				]}
			/>

			<Card>
				<CardHeader className="flex flex-row items-center justify-start gap-2">
					<Can permission="manage product categories">
						<Button asChild>
							<Link to="/productos-categorias/crear">
								<Plus className="mr-2 h-4 w-4" /> {"Crear Categoría"}
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
									placeholder={"Buscar categorías..."}
									className="pl-8"
									value={filters.search}
									onChange={(e) => setFilter('search', e.target.value)}
								/>
							</div>
							<CollapsibleTrigger asChild>
								<Button variant="outline" size="sm">
									<Filter className="mr-2 h-4 w-4" />
									{"Búsqueda Avanzada"}
									<ChevronDown
										className={`ml - 2 h - 4 w - 4 transition - transform ${isFiltersOpen ? 'rotate-180' : ''
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
									{"Limpiar Filtros"}
								</Button>
							</div>
						</CollapsibleContent>
					</Collapsible>

					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-10">
										<Checkbox
											checked={isAllSelected}
											onCheckedChange={toggleSelectAll}
										/>
									</TableHead>
									<TableHead className="w-[60px]">ID</TableHead>
									<TableHead className="w-[80px]">Imagen</TableHead>
									<TableHead
										className="cursor-pointer select-none"
										onClick={() => handleSort('name')}
									>
										<div className="flex items-center">
											Nombre
											{getSortIcon('name')}
										</div>
									</TableHead>
									<TableHead className="w-[100px]">
										<div className="flex items-center">
											En Home
										</div>
									</TableHead>
									<TableHead className="w-[100px]">
										<div className="flex items-center">
											Orden
										</div>
									</TableHead>
									<TableHead
										className="w-[130px] text-right cursor-pointer select-none"
										onClick={() => handleSort('created_at')}
									>
										<div className="flex items-center justify-end">
											Creado el
											{getSortIcon('created_at')}
										</div>
									</TableHead>
									<TableHead className="w-[100px] text-right">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading ? (
									<TableRow>
										<TableCell colSpan={8} className="h-24 text-center">
											Cargando...
										</TableCell>
									</TableRow>
								) : categories.length === 0 ? (
									<TableRow>
										<TableCell colSpan={8} className="h-24 text-center">
											No se encontraron datos.
										</TableCell>
									</TableRow>
								) : (
									categories.map((category) => (
										<TableRow key={category.id}>
											<TableCell>
												<Checkbox
													checked={selectedIds.includes(category.id)}
													onCheckedChange={() => toggleSelect(category.id)}
												/>
											</TableCell>
											<TableCell className="w-[60px]">{category.id}</TableCell>
											<TableCell className="w-[80px]">
												{category.image ? (
													<img src={category.image} alt={category.name} className="w-12 h-12 object-cover rounded" />
												) : null}
											</TableCell>
											<TableCell>{category.name}</TableCell>
											<TableCell className="w-[100px]">
												<Checkbox
													checked={category.listed}
													onCheckedChange={() => toggleListed(category)}
												/>
											</TableCell>
											<TableCell className="w-[100px]">
												<CrudInlineOrderEditor
													value={category.order}
													onSave={(order) => saveCategoryOrder(category, order)}
												/>
											</TableCell>
											<TableCell className="text-right w-[130px]">
												{new Date(category.created_at).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-right w-[100px]">
												<div className="flex items-center justify-end gap-1">
													{renderActions(category)}
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

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
