import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '@/lib/axios';
import {
	Search,
	Trash2,
	Eye,
	Clock,
	CheckCircle,
	XCircle,
	RefreshCw,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	FileDown,
	ReceiptText,
	Check,
	ExternalLink,
	Filter,
	X
} from 'lucide-react';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useBulkSelect } from '@/hooks/use-bulk-select';
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";
import { PriceModeBadge } from "@/components/price-mode-badge";
import ManualOrderForm from './ManualOrderForm';
import { AdminTableShell } from "@/components/admin-table-shell";

const showPaymentStatus = false;

const orderStatuses = [
	{ value: 'pending', label: 'Pendiente' },
	{ value: 'processing', label: 'Procesando' },
	{ value: 'completed', label: 'Completada' },
	{ value: 'cancelled', label: 'Cancelada' },
];

const paymentStatuses = [
	{ value: 'unpaid', label: 'Sin abonar' },
	{ value: 'processing', label: 'En proceso' },
	{ value: 'paid', label: 'Pagado' },
];

const priceModeFilters = [
	{ value: 'wholesale', label: 'Mayorista' },
	{ value: 'retail', label: 'Minorista' },
];

const statusFilterStyles = {
	pending: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/15 dark:text-yellow-400',
	processing: 'border-blue-500/30 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-400',
	completed: 'border-green-500/30 bg-green-500/10 text-green-700 hover:bg-green-500/15 dark:text-green-400',
	cancelled: 'border-red-500/30 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-400',
};

const ActiveFilterCheck = () => (
	<span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white">
		<Check className="h-3 w-3" />
	</span>
);

export default function OrdersList() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [activePriceMode, setActivePriceMode] = useState('');
	const [activeStatus, setActiveStatus] = useState('');
	const [dateFrom, setDateFrom] = useState('');
	const [dateTo, setDateTo] = useState('');
	const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
	const [meta, setMeta] = useState({});
	const [page, setPage] = useState(1);
	const [isDeleting, setIsDeleting] = useState(false);
	const [exportingFormat, setExportingFormat] = useState(null);
	const [exportingOrderPdfId, setExportingOrderPdfId] = useState(null);
	const [updatingStatusId, setUpdatingStatusId] = useState(null);
	const [updatingPaymentStatusId, setUpdatingPaymentStatusId] = useState(null);
	const [showManualOrderForm, setShowManualOrderForm] = useState(false);

	const {
		selectedIds,
		selectedCount,
		isAllSelected,
		toggleSelect,
		toggleSelectAll,
		clearSelection,
		isSelected
	} = useBulkSelect(orders);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(search);
		}, 500);
		return () => clearTimeout(handler);
	}, [search]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, activePriceMode, activeStatus, dateFrom, dateTo]);

	useEffect(() => {
		fetchOrders();
	}, [page, debouncedSearch, activePriceMode, activeStatus, dateFrom, dateTo]);

	useEffect(() => {
		clearSelection();
	}, [page, debouncedSearch, activePriceMode, activeStatus, dateFrom, dateTo]);

	const fetchOrders = async () => {
		setLoading(true);
		try {
			const response = await axiosClient.get('admin/orders', {
				params: {
					page,
					search: debouncedSearch,
					price_mode: activePriceMode || undefined,
					status: activeStatus || undefined,
					date_from: dateFrom || undefined,
					date_to: dateTo || undefined,
					perPage: 10
				}
			});
			setOrders(response.data.data);
			setMeta(response.data.meta || {});
		} catch (error) {
			toast.error('Error al cargar órdenes');
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteClick = (order) => {
		setOrderToDelete(order);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!orderToDelete) return;
		setIsDeleting(true);
		try {
			await axiosClient.delete(`admin/orders/${orderToDelete.id}`);
			toast.success('Orden eliminada correctamente');
			fetchOrders();
		} catch (error) {
			toast.error('Error al eliminar orden');
		} finally {
			setIsDeleting(false);
			setOrderToDelete(null);
		}
	};

	const handleBulkDelete = async () => {
		setIsDeleting(true);
		try {
			await axiosClient.post("admin/orders/bulk-delete");
			toast.success(`${selectedIds.length} órdenes eliminadas`);
			clearSelection();
			fetchOrders();
		} catch (error) {
			toast.error('Error en eliminación masiva');
		} finally {
			setIsDeleting(false);
		}
	};

	const handleExport = async (format) => {
		setExportingFormat(format);
		try {
			const response = await axiosClient.get('admin/orders/export', {
				params: {
					format,
					search: debouncedSearch,
					price_mode: activePriceMode || undefined,
					status: activeStatus || undefined,
					date_from: dateFrom || undefined,
					date_to: dateTo || undefined,
				},
				responseType: 'blob',
			});

			const blobUrl = URL.createObjectURL(response.data);
			const link = document.createElement('a');
			link.href = blobUrl;
			link.download = `orders.${format}`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(blobUrl);
			toast.success(`Exportación ${format.toUpperCase()} generada`);
		} catch (error) {
			toast.error('Error al exportar pedidos');
		} finally {
			setExportingFormat(null);
		}
	};

	const handleOrderPdfExport = async (orderId) => {
		setExportingOrderPdfId(orderId);
		try {
			const response = await axiosClient.get(`admin/orders/${orderId}/export`, {
				params: { format: 'pdf' },
				responseType: 'blob',
			});

			const blobUrl = URL.createObjectURL(response.data);
			const link = document.createElement('a');
			link.href = blobUrl;
			link.download = `order-${orderId}.pdf`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(blobUrl);
			toast.success('PDF del pedido generado');
		} catch (error) {
			toast.error('Error al exportar el pedido en PDF');
		} finally {
			setExportingOrderPdfId(null);
		}
	};

	const handleOrderPdfPreview = async (orderId) => {
		const previewWindow = window.open('', '_blank');

		if (!previewWindow) {
			toast.error('El navegador bloqueó la vista previa del PDF');
			return;
		}

		previewWindow.opener = null;
		previewWindow.document.title = `Pedido #${orderId}`;
		previewWindow.document.body.innerHTML = '<p style="font-family: sans-serif; padding: 16px;">Generando PDF...</p>';

		try {
			const response = await axiosClient.get(`admin/orders/${orderId}/export`, {
				params: { format: 'pdf' },
				responseType: 'blob',
			});

			const blobUrl = URL.createObjectURL(response.data);
			previewWindow.location.href = blobUrl;
			window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
		} catch (error) {
			previewWindow.close();
			toast.error('Error al abrir el PDF del pedido');
		}
	};

	const handleStatusChange = async (order, newStatus) => {
		if (order.status === newStatus || updatingStatusId === order.id) return;

		const previousOrders = orders;
		setUpdatingStatusId(order.id);
		setOrders((currentOrders) => currentOrders.map((currentOrder) => (
			currentOrder.id === order.id
				? { ...currentOrder, status: newStatus }
				: currentOrder
		)));

		try {
			await axiosClient.put(`admin/orders/${order.id}`, { status: newStatus });
			toast.success('Estado actualizado correctamente');
		} catch (error) {
			setOrders(previousOrders);
			toast.error('Error al actualizar el estado');
		} finally {
			setUpdatingStatusId(null);
		}
	};

	const handlePaymentStatusChange = async (order, newStatus) => {
		if (order.payment_status === newStatus || updatingPaymentStatusId === order.id) return;

		const previousOrders = orders;
		setUpdatingPaymentStatusId(order.id);
		setOrders((currentOrders) => currentOrders.map((currentOrder) => (
			currentOrder.id === order.id
				? { ...currentOrder, payment_status: newStatus }
				: currentOrder
		)));

		try {
			await axiosClient.put(`admin/orders/${order.id}`, { payment_status: newStatus });
			toast.success('Estado de pago actualizado correctamente');
		} catch (error) {
			setOrders(previousOrders);
			toast.error('Error al actualizar el estado de pago');
		} finally {
			setUpdatingPaymentStatusId(null);
		}
	};

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [orderToDelete, setOrderToDelete] = useState(null);

	const renderPagination = () => {
		if (!meta.last_page || meta.last_page <= 1) return null;
		const pages = [];
		const startPage = Math.max(1, page - 2);
		const endPage = Math.min(meta.last_page, startPage + 4);
		const adjustedStartPage = Math.max(1, endPage - 4);

		for (let i = adjustedStartPage; i <= endPage; i++) {
			pages.push(
				<Button key={i} variant={page === i ? "default" : "outline"} size="sm" onClick={() => setPage(i)}>
					{i}
				</Button>
			);
		}
		return pages;
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case 'completed':
				return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="mr-1 h-3 w-3" /> Completada</Badge>;
			case 'processing':
				return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><RefreshCw className="mr-1 h-3 w-3" /> Procesando</Badge>;
			case 'cancelled':
				return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="mr-1 h-3 w-3" /> Cancelada</Badge>;
			default:
				return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="mr-1 h-3 w-3" /> Pendiente</Badge>;
		}
	};

	const getPaymentStatusBadge = (status) => {
		switch (status) {
			case 'paid':
				return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="mr-1 h-3 w-3" /> Pagado</Badge>;
			case 'processing':
				return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><RefreshCw className="mr-1 h-3 w-3" /> En proceso</Badge>;
			default:
				return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="mr-1 h-3 w-3" /> Sin abonar</Badge>;
		}
	};

	const renderPaymentStatusDropdown = (order) => {
		const isUpdating = updatingPaymentStatusId === order.id;
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-full justify-start px-2 cursor-pointer" disabled={isUpdating}>
						{getPaymentStatusBadge(order.payment_status)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					{paymentStatuses.map((s) => (
						<DropdownMenuItem
							key={s.value}
							disabled={isUpdating || order.payment_status === s.value}
							onClick={() => handlePaymentStatusChange(order, s.value)}
						>
							{s.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		);
	};

	const renderStatusDropdown = (order) => {
		const isUpdating = updatingStatusId === order.id;

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="h-8 w-full justify-start px-2 cursor-pointer"
						disabled={isUpdating}
					>
						{getStatusBadge(order.status)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					{orderStatuses.map((status) => (
						<DropdownMenuItem
							key={status.value}
							disabled={isUpdating || order.status === status.value}
							onClick={() => handleStatusChange(order, status.value)}
						>
							{status.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		);
	};

	const togglePriceModeFilter = (value) => {
		setActivePriceMode((current) => current === value ? '' : value);
	};

	const toggleStatusFilter = (value) => {
		setActiveStatus((current) => current === value ? '' : value);
	};

	const clearAdvancedFilters = () => {
		setDateFrom('');
		setDateTo('');
	};

	return (
		<div className="space-y-6">
			<PageHeader
				title={"Pedidos"}
				breadcrumbs={[
					{ label: 'PEDIDOS' },
					{ label: "Listado" },
				]}
				actions={(
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" disabled={Boolean(exportingFormat)}>
								<FileDown className="mr-2 h-4 w-4" />
								{exportingFormat ? 'Exportando...' : 'Exportar'}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => handleExport('xlsx')}>
								XLSX
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleExport('csv')}>
								CSV
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleExport('pdf')}>
								PDF
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			/>

			<Card>
				<CardHeader>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						{/* <Button
							type="button"
							onClick={() => setShowManualOrderForm((current) => !current)}
							aria-expanded={showManualOrderForm}
						>
							Cargar pedido
						</Button> */}
						{showManualOrderForm && (
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowManualOrderForm(false)}
							>
								Cerrar carga
							</Button>
						)}
					</div>
				</CardHeader>


				<CardContent className="space-y-4">
					{showManualOrderForm && (
						<ManualOrderForm
							onCreated={() => {
								fetchOrders();
								setShowManualOrderForm(false);
							}}
						/>
					)}

					<div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
						<div className="space-y-3">
							<div className="grid grid-cols-4 gap-2">
							{priceModeFilters.map((filter) => (
								<Button
									key={filter.value}
									type="button"
									variant={activePriceMode === filter.value ? 'default' : 'outline'}
									size="sm"
									onClick={() => togglePriceModeFilter(filter.value)}
									aria-pressed={activePriceMode === filter.value}
									className="col-span-2 w-full justify-center"
								>
									{activePriceMode === filter.value && <ActiveFilterCheck />}
									{filter.label}
								</Button>
							))}
							</div>
							<div className="grid grid-cols-4 gap-2">
							{orderStatuses.map((status) => (
								<Button
									key={status.value}
									type="button"
									variant="outline"
									size="sm"
									onClick={() => toggleStatusFilter(status.value)}
									aria-pressed={activeStatus === status.value}
									className={cn(
										'w-full justify-center',
										statusFilterStyles[status.value],
										activeStatus === status.value && 'ring-2 ring-offset-2 ring-current'
									)}
								>
									{activeStatus === status.value && <ActiveFilterCheck />}
									{status.label}
								</Button>
							))}
							</div>
						</div>
						<div className="flex w-full items-center gap-2 lg:max-w-sm lg:justify-end">
							<div className="relative w-full">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Buscar orden o cliente..."
								className="pl-9"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setIsAdvancedFiltersOpen((current) => !current)}
								aria-expanded={isAdvancedFiltersOpen}
								className="shrink-0"
							>
								<Filter className="mr-2 h-4 w-4" />
								{"Filtros avanzados"}
								<ChevronDown
									className={cn('ml-2 h-4 w-4 transition-transform', isAdvancedFiltersOpen && 'rotate-180')}
								/>
							</Button>
						</div>
					</div>

					<Collapsible open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
						<CollapsibleContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 p-4 border rounded-lg bg-muted/50 sm:grid-cols-2 lg:grid-cols-4">
								<div className="space-y-2">
									<label htmlFor="filterDateFrom" className="text-sm font-medium">
										{"Fecha desde"}
									</label>
									<Input
										id="filterDateFrom"
										type="date"
										value={dateFrom}
										max={dateTo || undefined}
										onChange={(e) => setDateFrom(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<label htmlFor="filterDateTo" className="text-sm font-medium">
										{"Fecha hasta"}
									</label>
									<Input
										id="filterDateTo"
										type="date"
										value={dateTo}
										min={dateFrom || undefined}
										onChange={(e) => setDateTo(e.target.value)}
									/>
								</div>
							</div>
							<div className="flex justify-end">
								<Button variant="ghost" size="sm" onClick={clearAdvancedFilters}>
									<X className="mr-2 h-4 w-4" />
									{"Limpiar Filtros"}
								</Button>
							</div>
						</CollapsibleContent>
					</Collapsible>

					<AdminTableShell>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-10">
										<Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} />
									</TableHead>
									<TableHead className="w-[80px]">Order ID</TableHead>
									<TableHead>Cliente</TableHead>
									<TableHead>Fecha</TableHead>
									<TableHead>Tipo</TableHead>
									<TableHead>Estado</TableHead>
									{showPaymentStatus && <TableHead>Pago</TableHead>}
									<TableHead className="text-right">Total</TableHead>
									<TableHead data-sticky="right" className="text-right w-[150px]">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody className={loading ? "opacity-50 pointer-events-none" : ""}>
								{loading && orders.length === 0 && (
									<TableRow>
										<TableCell colSpan={showPaymentStatus ? 9 : 8} className="text-center">Cargando...</TableCell>
									</TableRow>
								)}
								{!loading && orders.length === 0 && (
									<TableRow>
										<TableCell colSpan={showPaymentStatus ? 9 : 8} className="text-center py-8 text-muted-foreground">
											No se encontraron órdenes.
										</TableCell>
									</TableRow>
								)}
								{orders.map((order) => (
									<TableRow key={order.id}>
										<TableCell>
											<Checkbox checked={isSelected(order.id)} onCheckedChange={() => toggleSelect(order.id)} />
										</TableCell>
										<TableCell className="font-medium text-muted-foreground">
											#{order.id}
										</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<span className="font-medium">{order.customer?.name || order.customer_data?.name || 'Invitado'}</span>
												<span className="text-xs text-muted-foreground">{order.customer?.email || order.customer_data?.email}</span>
											</div>
										</TableCell>
										<TableCell>
											{new Date(order.created_at).toLocaleDateString()}
										</TableCell>
										<TableCell>
											<PriceModeBadge mode={order.price_mode} />
										</TableCell>
										<TableCell>
											{renderStatusDropdown(order)}
										</TableCell>
										{showPaymentStatus && <TableCell>
											{renderPaymentStatusDropdown(order)}
										</TableCell>}
										<TableCell className="text-right font-medium">
											${parseFloat(order.total_amount).toFixed(2)} {order.currency}
										</TableCell>
										<TableCell data-sticky="right" className="text-right">
											<div className="flex items-center justify-end gap-1">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon" className="h-10 w-10 lg:hidden">
															<ChevronDown className="h-5 w-5" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem asChild>
															<Link to={`/pedidos/${order.id}`}>
																<Eye className="mr-2 h-4 w-4" /> Ver Detalles
															</Link>
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleOrderPdfPreview(order.id)}>
															<ExternalLink className="mr-2 h-4 w-4" />
															Ver PDF
														</DropdownMenuItem>
														<DropdownMenuItem
															disabled={exportingOrderPdfId === order.id}
															onClick={() => handleOrderPdfExport(order.id)}
														>
															<ReceiptText className="mr-2 h-4 w-4" />
															{exportingOrderPdfId === order.id ? 'Exportando...' : 'Exportar PDF'}
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleDeleteClick(order)} className="text-red-500">
															<Trash2 className="mr-2 h-4 w-4" /> Eliminar
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
												<div className="hidden lg:flex items-center gap-1">
													<Button variant="ghost" size="icon" className="h-8 w-8" title={`Ver pedido #${order.id}`} aria-label={`Ver pedido #${order.id}`} asChild>
														<Link to={`/pedidos/${order.id}`} title={`Ver pedido #${order.id}`} aria-label={`Ver pedido #${order.id}`}>
															<Eye className="h-4 w-4" />
														</Link>
													</Button>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="h-8 w-8"
														onClick={() => handleOrderPdfPreview(order.id)}
														title={`Ver PDF del pedido #${order.id}`}
														aria-label={`Ver PDF del pedido #${order.id}`}
													>
														<ExternalLink className="h-4 w-4" />
													</Button>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="h-8 w-8"
														onClick={() => handleOrderPdfExport(order.id)}
														disabled={exportingOrderPdfId === order.id}
														title={`Descargar PDF del pedido #${order.id}`}
														aria-label={`Exportar pedido #${order.id} en PDF`}
													>
														<ReceiptText className="h-4 w-4" />
													</Button>
													<Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteClick(order)} title={`Eliminar pedido #${order.id}`} aria-label={`Eliminar pedido #${order.id}`}>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</AdminTableShell>

					{meta.last_page > 1 && (
						<div className="flex items-center justify-end space-x-2 py-4">
							<Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
								<ChevronLeft className="h-4 w-4 mr-2" />
								Anterior
							</Button>
							<div className="flex items-center space-x-1">
								{renderPagination()}
							</div>
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
								{"Eliminar seleccionados"}
							</Button>
						</div>
					)}

					<ConfirmationDialog
						open={deleteDialogOpen}
						onOpenChange={setDeleteDialogOpen}
						title="¿Eliminar orden?"
						description={`Esta acción no se puede deshacer. Se perderá la orden #${orderToDelete?.id}.`}
						confirmText="Eliminar"
						cancelText="Cancelar"
						onConfirm={handleConfirmDelete}
						loading={isDeleting}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
