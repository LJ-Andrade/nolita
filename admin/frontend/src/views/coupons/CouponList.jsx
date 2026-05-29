import * as React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import axiosClient from '@/lib/axios';

export default function CouponList() {
	const navigate = useNavigate();
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [couponToDelete, setCouponToDelete] = useState(null);
	const [updatingId, setUpdatingId] = useState(null);

	const {
		items: coupons,
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
		fetchItems: refresh,
	} = useCrudList({
		endpoint: 'coupons',
		filterKeys: ['search', 'filter_id', 'filter_code'],
		defaultSort: { column: 'id', direction: 'desc' },
	});

	// Listen for refresh event from form
	React.useEffect(() => {
		const handleRefresh = () => refresh();
		window.addEventListener('refresh-coupons', handleRefresh);
		return () => window.removeEventListener('refresh-coupons', handleRefresh);
	}, [refresh]);

	const handleActiveToggle = async (coupon) => {
		if (!coupon || !coupon.id) {
			console.error('Coupon or coupon.id is undefined:', coupon);
			return;
		}
		console.log('Toggle coupon id:', coupon.id, 'current active:', coupon.active);
		setUpdatingId(coupon.id);
		try {
			const payload = {
				active: !coupon.active
			};
			await axiosClient.put(`/coupons/${coupon.id}`, payload);
			refresh();
		} catch (error) {
			console.error('Error updating coupon:', error);
		} finally {
			setUpdatingId(null);
		}
	};

	const columns = [
		{ key: 'id', label: "ID" || 'ID', sortable: true, width: 'w-[60px]' },
		{ key: 'code', label: "Código" || 'Código', sortable: true },
		{
			key: 'discount_type',
			label: "Tipo de descuento" || 'Tipo de descuento',
			sortable: true,
			render: (_, coupon) => (
				<Badge variant={coupon.discount_type === 'percentage' ? 'default' : 'secondary'}>
					{coupon.discount_type === 'percentage' ? "Porcentaje" : "Fijo"}
				</Badge>
			)
		},
		{
			key: 'amount',
			label: "Monto" || 'Monto',
			sortable: true,
			align: 'right',
			render: (_, coupon) => (
				coupon.discount_type === 'percentage'
					? `${coupon.amount}%`
					: `$${coupon.amount}`
			)
		},
		{
			key: 'expires_at',
			label: "Fecha de expiración" || 'Expira',
			sortable: true,
			width: 'w-[130px]',
			format: 'date'
		},
		{
			key: 'active',
			label: "Activo" || 'Activo',
			sortable: true,
			align: 'center',
			width: 'w-[80px]',
			render: (_, coupon) => {
				console.log('Switch render - coupon:', coupon);
				return (
					<Switch
						checked={coupon.active}
						onCheckedChange={() => handleActiveToggle(coupon)}
						disabled={updatingId === coupon.id}
					/>
				)
			}
		},
	];

	const handleDeleteClick = (coupon) => {
		setCouponToDelete(coupon);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!couponToDelete) return;

		const success = await deleteItem(couponToDelete.id, {
			successMessage: "Cupón eliminado correctamente" || 'Cupón eliminado correctamente',
			errorMessage: "Error al eliminar el cupón" || 'Error al eliminar el cupón',
		});

		if (success) {
			setDeleteDialogOpen(false);
			setCouponToDelete(null);
		}
	};

	const handleBulkDeleteClick = async () => {
		const success = await bulkDelete(selectedIds, {
			successMessage: "Elementos eliminados exitosamente",
			errorMessage: "Error al eliminar elementos",
		});

		if (success) clearSelection();
	};

	const renderActions = (coupon, isDropdown = false) => (
		<Can permission="users.view">
			{isDropdown ? (
				<>
					<DropdownMenuItem onClick={() => navigate(`/cupones/editar/${coupon.id}`)}>
						<Edit className="mr-2 h-4 w-4" /> {"Editar"}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleDeleteClick(coupon)} className="text-red-500">
						<Trash2 className="mr-2 h-4 w-4" /> {"Eliminar"}
					</DropdownMenuItem>
				</>
			) : (
				<>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => navigate(`/cupones/editar/${coupon.id}`)}
						title={`Editar cupón ${coupon.code}`}
						aria-label={`Editar cupón ${coupon.code}`}
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-red-500"
						onClick={() => handleDeleteClick(coupon)}
						title={`Eliminar cupón ${coupon.code}`}
						aria-label={`Eliminar cupón ${coupon.code}`}
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
				title={"Cupones"}
				breadcrumbs={[
					{ label: 'TIENDA' },
					{ label: "Cupones" },
				]}
			/>

			<Card>
				<CardHeader className="flex flex-row items-center justify-start gap-2">
					<Can permission="users.view">
						<Button asChild>
							<Link to="/cupones/crear">
								<Plus className="mr-2 h-4 w-4" /> {"Crear Cupón"}
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
									placeholder={"Buscar cupones..."}
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
									<label htmlFor="filterCode" className="text-sm font-medium">
										{"Código"}
									</label>
									<Input
										id="filterCode"
										placeholder={"Código"}
										value={filters.filter_code}
										onChange={(e) => setFilter('filter_code', e.target.value)}
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
						items={coupons}
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
