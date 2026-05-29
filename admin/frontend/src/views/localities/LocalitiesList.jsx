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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
	ChevronDown,
	Check,
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
import { useBulkSelect } from "@/hooks/use-bulk-select";
import { BulkActionsBar } from "@/components/bulk-actions-bar";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { PageHeader } from "@/components/page-header";

export default function LocalitiesList() {
	const [localities, setLocalities] = useState([]);
	const [provinces, setProvinces] = useState([]);
	const [loading, setLoading] = useState(false);
	const [meta, setMeta] = useState({});
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [filterProvince, setFilterProvince] = useState("");
	const [debouncedFilterProvince, setDebouncedFilterProvince] = useState("");
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [sortBy, setSortBy] = useState("name");
	const [sortDir, setSortDir] = useState("asc");
	const navigate = useNavigate();
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [localityToDelete, setLocalityToDelete] = useState(null);
	const [editingCostId, setEditingCostId] = useState(null);
	const [editingCostValue, setEditingCostValue] = useState("");
	const [savingCostId, setSavingCostId] = useState(null);
	const [showSuccessId, setShowSuccessId] = useState(null);

	const {
		selectedIds,
		selectedCount,
		isAllSelected,
		toggleSelect,
		toggleSelectAll,
		clearSelection,
		isSelected,
	} = useBulkSelect(localities);

	useEffect(() => {
		axiosClient.get("admin/provinces?all=1").then(({ data }) => {
			setProvinces(data.data || data);
		});
	}, []);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(search);
			setDebouncedFilterProvince(filterProvince);
		}, 500);
		return () => clearTimeout(handler);
	}, [search, filterProvince]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, debouncedFilterProvince]);

	useEffect(() => {
		getLocalities();
	}, [page, debouncedSearch, debouncedFilterProvince, sortBy, sortDir]);

	useEffect(() => {
		clearSelection();
	}, [page, debouncedSearch, debouncedFilterProvince, sortBy, sortDir]);

	const getLocalities = () => {
		setLoading(true);
		axiosClient
			.get("admin/localities", {
				params: {
					page,
					search: debouncedSearch,
					province_id: debouncedFilterProvince,
					sortField: sortBy,
					sortOrder: sortDir,
				},
			})
			.then(({ data }) => {
				setLocalities(data.data);
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
		setFilterProvince("");
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

	const onDeleteClick = (locality) => {
		setLocalityToDelete(locality);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!localityToDelete) return;
		axiosClient.delete(`admin/localities/${localityToDelete.id}`)
			.then(() => {
				toast.success("Localidad eliminada correctamente");
				getLocalities();
			})
			.catch((error) => {
				toast.error("Error al eliminar la localidad");
			})
			.finally(() => {
				setLocalityToDelete(null);
			});
	};

	const handleBulkDelete = () => {
		setIsDeleting(true);
		axiosClient.post("admin/localities/bulk-delete", { ids: selectedIds })
			.then(() => {
				toast.success("Elementos eliminados exitosamente");
				clearSelection();
				getLocalities();
			})
			.catch(() => {
				toast.error("Error al eliminar elementos");
			})
			.finally(() => {
				setIsDeleting(false);
			});
	};

	const startEditCost = (id, currentCost) => {
		setEditingCostId(id);
		setEditingCostValue(currentCost !== null ? String(currentCost) : "");
	};

	const cancelEditCost = () => {
		setEditingCostId(null);
		setEditingCostValue("");
	};

	const saveEditCost = (id) => {
		if (editingCostValue === "") {
			cancelEditCost();
			return;
		}
		const costValue = parseFloat(editingCostValue);
		if (isNaN(costValue) || costValue < 0) {
			toast.error("Ingresá un valor numérico positivo");
			return;
		}
		setSavingCostId(id);
		axiosClient.put(`admin/localities/${id}`, { cost: costValue })
			.then(() => {
				setEditingCostId(null);
				setShowSuccessId(id);
				setTimeout(() => setShowSuccessId(null), 2000);
				getLocalities();
			})
			.catch(() => {
				toast.error("Error al guardar");
			})
			.finally(() => {
				setSavingCostId(null);
			});
	};

	const handleCostKeyDown = (e, id) => {
		if (e.key === "Enter") {
			saveEditCost(id);
		} else if (e.key === "Escape") {
			cancelEditCost();
		}
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
				title={"Localidades"}
				breadcrumbs={[
					{ label: 'SISTEMA' },
					{ label: "Localidades" },
				]}
			/>

			<Card>
				<CardHeader className="flex flex-row items-center justify-start gap-2">
					<Button onClick={() => navigate("/localidades/crear")}>
						<Plus className="mr-2 h-4 w-4" /> Nueva Localidad
					</Button>
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
									placeholder={"Buscar localidades..."}
									className="pl-8"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>
							<CollapsibleTrigger asChild>
								<Button variant="outline" size="sm">
									Filtros
									<ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isFiltersOpen ? "rotate-180" : ""}`} />
								</Button>
							</CollapsibleTrigger>
						</div>

						<CollapsibleContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
								<div className="space-y-2">
									<label htmlFor="filterProvince" className="text-sm font-medium">{"Provincia"}</label>
									<select
										id="filterProvince"
										className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
										value={filterProvince}
										onChange={(e) => setFilterProvince(e.target.value)}
									>
										<option value="">Todas las provincias</option>
										{provinces.map((prov) => (
											<option key={prov.id} value={prov.id}>{prov.name}</option>
										))}
									</select>
								</div>
							</div>
							<div className="flex justify-end">
								<Button
									variant="ghost"
									size="sm"
									onClick={handleClearFilters}
								>
									Limpiar Filtros
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
								<TableHead className="w-[60px]">{"ID"}</TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort("name")}
								>
									<div className="flex items-center">
										{"Nombre"} {renderSortIcon("name")}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort("province_id")}
								>
									<div className="flex items-center">
										{"Provincia"} {renderSortIcon("province_id")}
									</div>
								</TableHead>
								<TableHead className="text-right w-[100px]">{"Costo"}</TableHead>
								<TableHead data-sticky="right" className="text-right w-[120px]">{"Acciones"}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className={loading ? "opacity-50 pointer-events-none" : ""}>
							{loading && localities.length === 0 && (
								<TableRow>
									<TableCell colSpan={6} className="text-center">
										{"Cargando..."}
									</TableCell>
								</TableRow>
							)}
							{!loading && localities.length === 0 && (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
										{"No se encontraron datos."}
									</TableCell>
								</TableRow>
							)}
							{localities.map((locality) => (
								<TableRow key={locality.id}>
									<TableCell>
										<Checkbox
											checked={isSelected(locality.id)}
											onCheckedChange={() => toggleSelect(locality.id)}
										/>
									</TableCell>
									<TableCell className="w-[60px]">{locality.id}</TableCell>
									<TableCell>{locality.name}</TableCell>
									<TableCell>{locality.province?.name || '-'}</TableCell>
									<TableCell className="text-right w-[140px]">
										{editingCostId === locality.id ? (
											<div className="flex items-center justify-end gap-1">
												<Input
													type="number"
													step="0.01"
													min="0"
													className="w-24 h-7 text-right text-sm"
													value={editingCostValue}
													onChange={(e) => setEditingCostValue(e.target.value)}
													onKeyDown={(e) => handleCostKeyDown(e, locality.id)}
													autoFocus
												/>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-green-500 hover:text-green-600"
													onClick={() => saveEditCost(locality.id)}
													disabled={savingCostId === locality.id}
												>
													{savingCostId === locality.id ? (
														<div className="h-4 w-4 border-2 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
													) : (
														<Check className="h-4 w-4" />
													)}
												</Button>
											</div>
										) : showSuccessId === locality.id ? (
											<div className="flex items-center justify-end gap-1 text-green-500">
												<span className="text-sm">${parseFloat(locality.cost).toFixed(2)}</span>
												<Check className="h-4 w-4" />
											</div>
										) : (
											<div 
												className="flex items-center justify-end gap-1 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1"
												onClick={() => startEditCost(locality.id, locality.cost)}
											>
												<span className="text-sm">
													{locality.cost ? `$${parseFloat(locality.cost).toFixed(2)}` : '-'}
												</span>
											</div>
										)}
									</TableCell>
											<TableCell data-sticky="right" className="text-right w-[120px]">
												<div className="flex items-center justify-end gap-1">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon" className="h-10 w-10 lg:hidden">
														<ChevronDown className="h-5 w-5" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onClick={() => navigate(`/localidades/editar/${locality.id}`)}>
														<Edit className="mr-2 h-4 w-4" /> Editar
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => onDeleteClick(locality)} className="text-red-500">
														<Trash2 className="mr-2 h-4 w-4" /> Eliminar
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
											<div className="hidden lg:flex items-center gap-1">
												<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/localidades/editar/${locality.id}`)}>
													<Edit className="h-4 w-4" />
												</Button>
												<Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDeleteClick(locality)}>
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
