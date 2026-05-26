import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '@/lib/axios';
import {
	Search,
	Trash2,
	Mail,
	Phone,
	ChevronLeft,
	ChevronRight,
	Check,
	Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useBulkSelect } from '@/hooks/use-bulk-select';
import { cn } from '@/lib/utils';

const priceModeFilters = [
	{ value: 'wholesale', label: 'Mayorista' },
	{ value: 'retail', label: 'Minorista' },
];

const ActiveFilterCheck = () => (
	<span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white">
		<Check className="h-3 w-3" />
	</span>
);

const formatCurrency = (value) => {
	const number = Number(value || 0);
	return `$${number.toFixed(2)}`;
};

const formatDate = (value) => {
	if (!value) return '-';
	try {
		return new Date(value).toLocaleDateString();
	} catch (e) {
		return '-';
	}
};

export default function GuestCustomersTab() {
	const [guests, setGuests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [activePriceMode, setActivePriceMode] = useState('');
	const [meta, setMeta] = useState({});
	const [page, setPage] = useState(1);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [guestToDelete, setGuestToDelete] = useState(null);

	const {
		selectedIds,
		selectedCount,
		isAllSelected,
		toggleSelect,
		toggleSelectAll,
		clearSelection,
		isSelected,
	} = useBulkSelect(guests);

	useEffect(() => {
		const handler = setTimeout(() => setDebouncedSearch(search), 500);
		return () => clearTimeout(handler);
	}, [search]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, activePriceMode]);

	useEffect(() => {
		fetchGuests();
	}, [page, debouncedSearch, activePriceMode]);

	useEffect(() => {
		clearSelection();
	}, [page, debouncedSearch, activePriceMode]);

	const fetchGuests = async () => {
		setLoading(true);
		try {
			const response = await axiosClient.get('admin/guest-customers', {
				params: {
					page,
					search: debouncedSearch,
					price_mode: activePriceMode || undefined,
					perPage: 10,
				},
			});
			setGuests(response.data.data);
			setMeta(response.data.meta || {});
		} catch (error) {
			toast.error('Error al cargar clientes invitados');
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteClick = (guest) => {
		setGuestToDelete(guest);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!guestToDelete) return;
		setIsDeleting(true);
		try {
			await axiosClient.delete(`admin/guest-customers/${guestToDelete.id}`);
			toast.success('Cliente invitado eliminado');
			fetchGuests();
		} catch (error) {
			toast.error('Error al eliminar cliente invitado');
		} finally {
			setIsDeleting(false);
			setGuestToDelete(null);
		}
	};

	const handleBulkDelete = async () => {
		setIsDeleting(true);
		try {
			await axiosClient.post('admin/guest-customers/bulk-delete', { ids: selectedIds });
			toast.success(`${selectedIds.length} clientes invitados eliminados`);
			clearSelection();
			fetchGuests();
		} catch (error) {
			toast.error('Error en eliminación masiva');
		} finally {
			setIsDeleting(false);
		}
	};

	const togglePriceModeFilter = (value) => {
		setActivePriceMode((current) => (current === value ? '' : value));
	};

	const renderPagination = () => {
		if (!meta.last_page || meta.last_page <= 1) return null;
		const pages = [];
		const startPage = Math.max(1, page - 2);
		const endPage = Math.min(meta.last_page, startPage + 4);
		const adjustedStartPage = Math.max(1, endPage - 4);
		for (let i = adjustedStartPage; i <= endPage; i++) {
			pages.push(
				<Button key={i} variant={page === i ? 'default' : 'outline'} size="sm" onClick={() => setPage(i)}>
					{i}
				</Button>
			);
		}
		return pages;
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
				<div className="grid grid-cols-2 gap-2 sm:max-w-xs">
					{priceModeFilters.map((filter) => (
						<Button
							key={filter.value}
							type="button"
							variant={activePriceMode === filter.value ? 'default' : 'outline'}
							size="sm"
							onClick={() => togglePriceModeFilter(filter.value)}
							aria-pressed={activePriceMode === filter.value}
							className="w-full justify-center"
						>
							{activePriceMode === filter.value && <ActiveFilterCheck />}
							{filter.label}
						</Button>
					))}
				</div>
				<div className="flex w-full items-center gap-2 lg:max-w-sm lg:justify-end">
					<div className="relative w-full">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Buscar nombre, email o teléfono..."
							className="pl-9"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-10">
							<Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} />
						</TableHead>
						<TableHead>Nombre</TableHead>
						<TableHead>Contacto</TableHead>
						<TableHead>Modo</TableHead>
						<TableHead className="text-right">Pedidos</TableHead>
						<TableHead>Último pedido</TableHead>
						<TableHead className="text-right">Total gastado</TableHead>
						<TableHead className="text-right w-[120px]">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody className={loading ? 'opacity-50 pointer-events-none' : ''}>
					{loading && guests.length === 0 && (
						<TableRow>
							<TableCell colSpan={8} className="text-center">Cargando...</TableCell>
						</TableRow>
					)}
					{!loading && guests.length === 0 && (
						<TableRow>
							<TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
								No se encontraron clientes invitados.
							</TableCell>
						</TableRow>
					)}
					{guests.map((guest) => (
						<TableRow key={guest.id}>
							<TableCell>
								<Checkbox checked={isSelected(guest.id)} onCheckedChange={() => toggleSelect(guest.id)} />
							</TableCell>
							<TableCell>
								<span className="font-medium">{guest.name || 'Sin nombre'}</span>
							</TableCell>
							<TableCell>
								<div className="flex flex-col gap-0.5 text-sm">
									<div className="flex items-center gap-1.5 text-muted-foreground">
										<Mail className="h-3 w-3" /> {guest.email}
									</div>
									{guest.phone && (
										<div className="flex items-center gap-1.5 text-muted-foreground">
											<Phone className="h-3 w-3" /> {guest.phone}
										</div>
									)}
								</div>
							</TableCell>
							<TableCell>
								<div className="flex flex-wrap gap-1">
									{guest.bought_wholesale && (
										<Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Mayorista</Badge>
									)}
									{guest.bought_retail && (
										<Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Minorista</Badge>
									)}
									{!guest.bought_wholesale && !guest.bought_retail && (
										<span className="text-xs text-muted-foreground italic">-</span>
									)}
								</div>
							</TableCell>
							<TableCell className="text-right font-medium">{guest.orders_count}</TableCell>
							<TableCell className="text-sm text-muted-foreground">{formatDate(guest.last_order_at)}</TableCell>
							<TableCell className="text-right font-medium">{formatCurrency(guest.total_spent)}</TableCell>
							<TableCell className="text-right">
								<div className="flex items-center justify-end gap-1">
									<Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Ver pedidos">
										<Link to={`/pedidos?search=${encodeURIComponent(guest.email)}`}>
											<Eye className="h-4 w-4" />
										</Link>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-red-500"
										onClick={() => handleDeleteClick(guest)}
										title="Eliminar"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{meta.last_page > 1 && (
				<div className="flex items-center justify-end space-x-2 py-4">
					<Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
						<ChevronLeft className="h-4 w-4 mr-2" />
						Anterior
					</Button>
					<div className="flex items-center space-x-1">{renderPagination()}</div>
					<Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === meta.last_page}>
						Siguiente
						<ChevronRight className="h-4 w-4 ml-2" />
					</Button>
				</div>
			)}

			{selectedCount > 0 && (
				<div className="flex items-center justify-between py-4 border-t">
					<span className="text-sm text-muted-foreground">{selectedCount} seleccionados</span>
					<Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isDeleting}>
						<Trash2 className="mr-2 h-4 w-4" />
						Eliminar seleccionados
					</Button>
				</div>
			)}

			<ConfirmationDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="¿Eliminar cliente invitado?"
				description={`Esta acción no se puede deshacer. Se perderán los datos de "${guestToDelete?.name || guestToDelete?.email}". Los pedidos asociados se conservan.`}
				confirmText="Eliminar"
				cancelText="Cancelar"
				onConfirm={handleConfirmDelete}
				loading={isDeleting}
			/>
		</div>
	);
}
