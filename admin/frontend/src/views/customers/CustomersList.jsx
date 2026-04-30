import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '@/lib/axios';
import {
	Plus,
	Search,
	Trash2,
	Edit,
	Building2,
	Globe,
	Phone,
	Mail,
	UserCheck,
	UserMinus,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
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
import { PageHeader } from '@/components/page-header';
import Can from '@/components/can';
export default function CustomersList() {
	const [customers, setCustomers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [meta, setMeta] = useState({});
	const [page, setPage] = useState(1);
	const [isDeleting, setIsDeleting] = useState(false);

	const {
		selectedIds,
		selectedCount,
		isAllSelected,
		toggleSelect,
		toggleSelectAll,
		clearSelection,
		isSelected
	} = useBulkSelect(customers);

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
		fetchCustomers();
	}, [page, debouncedSearch]);

	useEffect(() => {
		clearSelection();
	}, [page, debouncedSearch]);

	const fetchCustomers = async () => {
		setLoading(true);
		try {
			const response = await axiosClient.get('admin/customers', {
				params: {
					page,
					search: debouncedSearch,
					perPage: 10
				}
			});
			setCustomers(response.data.data);
			setMeta(response.data.meta || {});
		} catch (error) {
			toast.error('Error al cargar clientes');
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteClick = (customer) => {
		setCustomerToDelete(customer);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!customerToDelete) return;
		setIsDeleting(true);
		try {
			await axiosClient.delete(`admin/customers/${customerToDelete.id}`);
			toast.success('Cliente eliminado correctamente');
			fetchCustomers();
		} catch (error) {
			toast.error('Error al eliminar cliente');
		} finally {
			setIsDeleting(false);
			setCustomerToDelete(null);
		}
	};

	const handleBulkDelete = async () => {
		setIsDeleting(true);
		try {
			await axiosClient.post("admin/customers/bulk-delete");
			toast.success(`${selectedIds.length} clientes eliminados`);
			clearSelection();
			fetchCustomers();
		} catch (error) {
			toast.error('Error en eliminación masiva');
		} finally {
			setIsDeleting(false);
		}
	};

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [customerToDelete, setCustomerToDelete] = useState(null);

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

	return (
		<div className="space-y-6">
			<PageHeader
				title={"Clientes"}
				breadcrumbs={[
					{ label: 'CLIENTES' },
					{ label: "Listado" },
				]}
			/>

			<Card>
				<CardHeader className="flex flex-row items-center justify-start gap-2">
					<Can permission="manage customers">
						<Button asChild>
							<Link to="/clientes/crear">
								<Plus className="mr-2 h-4 w-4" /> {"Nuevo Cliente"}
							</Link>
						</Button>
					</Can>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-2 max-w-sm">
						<div className="relative w-full">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder={"Buscar cliente..."}
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
							<TableHead className="w-[60px]">{"ID"}</TableHead>
							<TableHead>{"Nombre"}</TableHead>
							<TableHead>{"DNI"}</TableHead>
							<TableHead>{"Correo"}</TableHead>
							<TableHead>{"Dirección"}</TableHead>
							<TableHead>{"CP"}</TableHead>
								<TableHead>{"Estado"}</TableHead>
								<TableHead className="text-right w-[150px]">{"Acciones"}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className={loading ? "opacity-50 pointer-events-none" : ""}>
						{loading && customers.length === 0 && (
							<TableRow>
								<TableCell colSpan={9} className="text-center">Cargando...</TableCell>
							</TableRow>
						)}
						{!loading && customers.length === 0 && (
							<TableRow>
								<TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
									No se encontraron clientes.
								</TableCell>
							</TableRow>
						)}
							{customers.map((customer) => (
								<TableRow key={customer.id}>
									<TableCell>
										<Checkbox checked={isSelected(customer.id)} onCheckedChange={() => toggleSelect(customer.id)} />
									</TableCell>
									<TableCell className="font-medium text-muted-foreground">
										{customer.id}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-3">
											<div className="h-8 w-8 rounded bg-muted flex items-center justify-center overflow-hidden border">
												{customer.avatar_url ? (
													<img src={customer.avatar_url} alt={customer.name} className="h-full w-full object-cover" />
												) : (
													<Building2 className="h-4 w-4 text-muted-foreground" />
												)}
											</div>
											<span className="font-medium">{customer.name}</span>
										</div>
									</TableCell>
									<TableCell>
										<span className="font-mono text-sm">{customer.dni}</span>
									</TableCell>
									<TableCell>
										<div className="flex flex-col gap-0.5 text-sm">
											<div className="flex items-center gap-1.5 text-muted-foreground">
												<Mail className="h-3 w-3" /> {customer.email || 'N/A'}
											</div>
											{customer.phone && (
												<div className="flex items-center gap-1.5 text-muted-foreground">
													<Phone className="h-3 w-3" /> {customer.phone}
												</div>
											)}
										</div>
									</TableCell>
									<TableCell className="max-w-[200px] truncate">
										{customer.address ? (
											<span className="text-xs text-muted-foreground">{customer.address}</span>
										) : (
											<span className="text-xs text-muted-foreground italic">{"Ninguno"}</span>
										)}
									</TableCell>
									<TableCell>
										<span className="font-mono text-sm text-muted-foreground">
											{customer.postal_code || "N/A"}
										</span>
									</TableCell>
									<TableCell>
										{customer.is_active ? (
											<Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
												<UserCheck className="h-3 w-3" /> {"Activo"}
											</Badge>
										) : (
											<Badge variant="secondary" className="gap-1">
												<UserMinus className="h-3 w-3" /> {"Inactivo"}
											</Badge>
										)}
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
														<Link to={`/clientes/editar/${customer.id}`}>
															<Edit className="mr-2 h-4 w-4" /> Editar
														</Link>
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleDeleteClick(customer)} className="text-red-500">
														<Trash2 className="mr-2 h-4 w-4" /> Eliminar
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
											<div className="hidden lg:flex items-center gap-1">
												<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
													<Link to={`/clientes/editar/${customer.id}`}>
														<Edit className="h-4 w-4" />
													</Link>
												</Button>
												<Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteClick(customer)}>
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
								{"Anterior"}
							</Button>
							<div className="flex items-center space-x-1">
								{renderPagination()}
							</div>
							<Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === meta.last_page}>
								{"Siguiente"}
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
						title="¿Eliminar cliente?"
						description={`Esta acción no se puede deshacer. Se perderán los datos de "${customerToDelete?.name}".`}
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
