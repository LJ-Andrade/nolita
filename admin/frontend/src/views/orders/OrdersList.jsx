import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '@/lib/axios';
import {
	Search,
	Trash2,
	Eye,
	ShoppingBag,
	Clock,
	CheckCircle,
	XCircle,
	RefreshCw,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	FileDown
} from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function OrdersList() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [meta, setMeta] = useState({});
	const [page, setPage] = useState(1);
	const [isDeleting, setIsDeleting] = useState(false);
	const [exportingFormat, setExportingFormat] = useState(null);

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
	}, [debouncedSearch]);

	useEffect(() => {
		fetchOrders();
	}, [page, debouncedSearch]);

	useEffect(() => {
		clearSelection();
	}, [page, debouncedSearch]);

	const fetchOrders = async () => {
		setLoading(true);
		try {
			const response = await axiosClient.get('admin/orders', {
				params: {
					page,
					search: debouncedSearch,
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
					<CardTitle>{"Gestionar Pedidos"}</CardTitle>
				</CardHeader>


				<CardContent className="space-y-4">
					<div className="flex items-center gap-2 max-w-sm">
						<div className="relative w-full">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Buscar orden o cliente..."
								className="pl-9"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-10">
									<Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} />
								</TableHead>
								<TableHead className="w-[80px]">Order ID</TableHead>
								<TableHead>Cliente</TableHead>
								<TableHead>Fecha</TableHead>
								<TableHead>Estado</TableHead>
								<TableHead className="text-right">Total</TableHead>
								<TableHead className="text-right w-[150px]">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className={loading ? "opacity-50 pointer-events-none" : ""}>
							{loading && orders.length === 0 && (
								<TableRow>
									<TableCell colSpan={7} className="text-center">Cargando...</TableCell>
								</TableRow>
							)}
							{!loading && orders.length === 0 && (
								<TableRow>
									<TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
											<span className="font-medium">{order.customer?.name || 'Invitado'}</span>
											<span className="text-xs text-muted-foreground">{order.customer?.email}</span>
										</div>
									</TableCell>
									<TableCell>
										{new Date(order.created_at).toLocaleDateString()}
									</TableCell>
									<TableCell>
										{getStatusBadge(order.status)}
									</TableCell>
									<TableCell className="text-right font-medium">
										${parseFloat(order.total_amount).toFixed(2)} {order.currency}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-1">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden">
														<ChevronDown className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem asChild>
														<Link to={`/pedidos/${order.id}`}>
															<Eye className="mr-2 h-4 w-4" /> Ver Detalles
														</Link>
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleDeleteClick(order)} className="text-red-500">
														<Trash2 className="mr-2 h-4 w-4" /> Eliminar
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
											<div className="hidden lg:flex items-center gap-1">
												<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
													<Link to={`/pedidos/${order.id}`}>
														<Eye className="h-4 w-4" />
													</Link>
												</Button>
												<Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteClick(order)}>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
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
