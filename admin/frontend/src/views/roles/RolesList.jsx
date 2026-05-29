import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { AdminTableShell } from "@/components/admin-table-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Plus,
	Edit,
	Trash2,
	ChevronLeft,
	ChevronRight,
	Search,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	Filter,
	X,
	ChevronDown,
} from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Can from "@/components/can";
import { useBulkSelect } from "@/hooks/use-bulk-select";
import { BulkActionsBar } from "@/components/bulk-actions-bar";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { PageHeader } from "@/components/page-header";

export default function RolesList() {
	const [roles, setRoles] = useState([]);
	const [loading, setLoading] = useState(false);
	const [meta, setMeta] = useState({});
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [filterId, setFilterId] = useState("");
	const [debouncedFilterId, setDebouncedFilterId] = useState("");
	const [filterName, setFilterName] = useState("");
	const [debouncedFilterName, setDebouncedFilterName] = useState("");
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [sortBy, setSortBy] = useState("id");
	const [sortDir, setSortDir] = useState("desc");
	const navigate = useNavigate();
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [roleToDelete, setRoleToDelete] = useState(null);

	const {
		selectedIds,
		selectedCount,
		isAllSelected,
		toggleSelect,
		toggleSelectAll,
		clearSelection,
		isSelected,
	} = useBulkSelect(roles);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(search);
			setDebouncedFilterId(filterId);
			setDebouncedFilterName(filterName);
		}, 500);

		return () => {
			clearTimeout(handler);
		};
	}, [search, filterId, filterName]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, debouncedFilterId, debouncedFilterName]);

	useEffect(() => {
		getRoles();
	}, [page, debouncedSearch, debouncedFilterId, debouncedFilterName, sortBy, sortDir]);

	useEffect(() => {
		clearSelection();
	}, [page, debouncedSearch, debouncedFilterId, debouncedFilterName, sortBy, sortDir]);

	const getRoles = () => {
		setLoading(true);
		axiosClient
			.get("roles", {
				params: {
					page,
					search: debouncedSearch,
					filter_id: debouncedFilterId,
					filter_name: debouncedFilterName,
					sort_by: sortBy,
					sort_dir: sortDir,
				},
			})
			.then(({ data }) => {
				setRoles(data.data);
				setMeta(data.meta || {});
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
			});
	};

	const handleSort = (column) => {
		if (sortBy === column) {
			setSortDir(sortDir === "asc" ? "desc" : "asc");
		} else {
			setSortBy(column);
			setSortDir("asc");
		}
	};

	const handleClearFilters = () => {
		setSearch("");
		setFilterId("");
		setFilterName("");
		setPage(1);
	};

	const renderSortIcon = (column) => {
		if (sortBy !== column) {
			return <ArrowUpDown className="ml-2 h-4 w-4" />;
		}
		return sortDir === "asc" ? (
			<ArrowUp className="ml-2 h-4 w-4" />
		) : (
			<ArrowDown className="ml-2 h-4 w-4" />
		);
	};

	const onDeleteClick = (role) => {
		setRoleToDelete(role);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!roleToDelete) return;
		axiosClient.delete(`roles/${roleToDelete.id}`)
			.then(() => {
				toast.success("Rol eliminado correctamente");
				getRoles();
			})
			.catch((error) => {
				toast.error("Error al eliminar el rol");
				console.error(error);
			})
			.finally(() => {
				setRoleToDelete(null);
			});
	};

	const handleBulkDelete = () => {
		setIsDeleting(true);
		axiosClient.post("roles/bulk-delete")
			.then(() => {
				toast.success("Elementos eliminados exitosamente");
				clearSelection();
				getRoles();
			})
			.catch(() => {
				toast.error("Error al eliminar elementos");
			})
			.finally(() => {
				setIsDeleting(false);
			});
	};

	const renderPagination = () => {
		const pages = [];
		if (!meta.last_page) return pages;

		const startPage = Math.max(1, page - 2);
		const endPage = Math.min(meta.last_page, startPage + 4);
		const adjustedStartPage = Math.max(1, endPage - 4);

		for (let i = adjustedStartPage; i <= endPage; i++) {
			pages.push(
				<Button
					key={i}
					variant={page === i ? "default" : "outline"}
					size="sm"
					onClick={() => setPage(i)}
				>
					{i}
				</Button>
			);
		}
		return pages;
	};

	return (
		<div className="space-y-6">
			<PageHeader
				title={"Roles"}
				breadcrumbs={[
					{ label: 'USUARIOS' },
					{ label: "Roles" },
				]}
			/>

			<Card>
				<CardHeader className="flex flex-row items-center justify-start gap-2">
					<Can permission="create roles">
						<Button onClick={() => navigate("/roles/crear")}>
							<Plus className="mr-2 h-4 w-4" /> Nuevo Rol
						</Button>
					</Can>
				</CardHeader>
				<CardContent>
					<Collapsible
						open={isFiltersOpen}
						onOpenChange={setIsFiltersOpen}
						className="space-y-4 pb-4"
					>
						<div className="flex items-center justify-between">
							<div className="relative w-full max-w-sm">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder={"Buscar roles..."}
									className="pl-8"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>
							<CollapsibleTrigger asChild>
								<Button variant="outline" size="sm">
									<Filter className="mr-2 h-4 w-4" />
									{"Búsqueda Avanzada"}
									<ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isFiltersOpen ? "rotate-180" : ""}`} />
								</Button>
							</CollapsibleTrigger>
						</div>

						<CollapsibleContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
								<div className="space-y-2">
									<label htmlFor="filterId" className="text-sm font-medium">{"ID"}</label>
									<Input
										id="filterId"
										placeholder={"Filtrar por ID"}
										value={filterId}
										onChange={(e) => setFilterId(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<label htmlFor="filterName" className="text-sm font-medium">{"Nombre"}</label>
									<Input
										id="filterName"
										placeholder={"Filtrar por Nombre"}
										value={filterName}
										onChange={(e) => setFilterName(e.target.value)}
									/>
								</div>
							</div>
							<div className="flex justify-end">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleClearFilters}
								>
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
									<Checkbox
										checked={isAllSelected}
										onCheckedChange={toggleSelectAll}
									/>
								</TableHead>
								<TableHead
									className="cursor-pointer select-none w-[60px]"
									onClick={() => handleSort("id")}
								>
									<div className="flex items-center">
										{"ID"} {renderSortIcon("id")}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort("name")}
								>
									<div className="flex items-center">
										{"Nombre"} {renderSortIcon("name")}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer select-none text-right w-[130px]"
									onClick={() => handleSort("created_at")}
								>
									<div className="flex items-center justify-end">
										{"Creado el"} {renderSortIcon("created_at")}
									</div>
								</TableHead>
								<TableHead data-sticky="right" className="text-right w-[120px]">{"Acciones"}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className={loading ? "opacity-50 pointer-events-none" : ""}>
							{loading && roles.length === 0 && (
								<TableRow>
									<TableCell colSpan={5} className="text-center">
										{"Cargando..."}
									</TableCell>
								</TableRow>
							)}
							{!loading && roles.length === 0 && (
								<TableRow>
									<TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
										{"No se encontraron datos."}
									</TableCell>
								</TableRow>
							)}
							{roles.map((role) => (
								<TableRow key={role.id}>
									<TableCell>
										<Checkbox
											checked={isSelected(role.id)}
											onCheckedChange={() => toggleSelect(role.id)}
										/>
									</TableCell>
									<TableCell className="w-[60px]">{role.id}</TableCell>
									<TableCell>{role.display_name || role.name}</TableCell>
									<TableCell className="text-right w-[130px]">{role.created_at ? formatDate(role.created_at) : ''}</TableCell>
												<TableCell data-sticky="right" className="text-right w-[120px]">
													<div className="flex items-center justify-end gap-1">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon" className="h-10 w-10 lg:hidden">
														<ChevronDown className="h-5 w-5" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<Can permission="edit roles">
														<DropdownMenuItem onClick={() => navigate(`/roles/editar/${role.id}`)}>
															<Edit className="mr-2 h-4 w-4" /> Editar
														</DropdownMenuItem>
													</Can>
													<Can permission="delete roles">
														<DropdownMenuItem onClick={() => onDeleteClick(role)} className="text-red-500">
															<Trash2 className="mr-2 h-4 w-4" /> Eliminar
														</DropdownMenuItem>
													</Can>
												</DropdownMenuContent>
											</DropdownMenu>
											<div className="hidden lg:flex items-center gap-1">
												<Can permission="edit roles">
													<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/roles/editar/${role.id}`)}>
														<Edit className="h-4 w-4" />
													</Button>
												</Can>
												<Can permission="delete roles">
													<Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDeleteClick(role)}>
														<Trash2 className="h-4 w-4" />
													</Button>
												</Can>
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
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(page - 1)}
								disabled={page === 1}
							>
								<ChevronLeft className="h-4 w-4 mr-2" />
								{"Anterior"}
							</Button>
							<div className="flex items-center space-x-1">
								{renderPagination()}
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(page + 1)}
								disabled={page === meta.last_page}
							>
								{"Siguiente"}
								<ChevronRight className="h-4 w-4 ml-2" />
							</Button>
						</div>
					)}
				</CardContent>
				<BulkActionsBar
					selectedCount={selectedCount}
					onDelete={handleBulkDelete}
					onClear={clearSelection}
					isDeleting={isDeleting}
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
			</Card>
		</div>
	);
}
