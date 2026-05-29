import { useEffect, useState, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Plus,
	Edit,
	Trash2,
	Search,
	Filter,
	X,
	ChevronDown,
	Image as ImageIcon,
	Eye,
	Star,
} from "lucide-react";
import ArticlePreview from "@/components/article-preview";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Can from "@/components/can";
import { useCrudList } from "@/hooks/use-crud-list";
import { CrudPagination } from "@/components/crud-pagination";
import { BulkActionsBar } from "@/components/bulk-actions-bar";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { PageHeader } from "@/components/page-header";

export default function ArticlesList() {
	const navigate = useNavigate();
	const [categories, setCategories] = useState([]);
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewArticle, setPreviewArticle] = useState(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [articleToDelete, setArticleToDelete] = useState(null);

	const {
		items: articles,
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
		endpoint: 'articles',
		filterKeys: ['search', 'category_id', 'status'],
		defaultSort: { column: 'id', direction: 'desc' },
	});

	useEffect(() => {
		axiosClient.get("categories?all=1").then(({ data }) => {
			setCategories(data.data || []);
		});
	}, []);

	const quickUpdate = useCallback((id, field, value) => {
		axiosClient.patch(`/articles/${id}`, { [field]: value })
			.then(() => {
				toast.success("Artículo actualizado correctamente");
			})
			.catch((error) => {
				toast.error("Ocurrió un error");
				console.error(error);
			});
	}, []);

	const handleToggleFeatured = (article) => {
		quickUpdate(article.id, 'featured', !article.featured);
	};

	const handleStatusChange = (article, newStatus) => {
		quickUpdate(article.id, 'status', newStatus);
	};

	const handleOrderChange = useCallback((id, newOrder) => {
		quickUpdate(id, 'order', parseInt(newOrder) || 0);
	}, [quickUpdate]);

	const handleDeleteClick = (article) => {
		setArticleToDelete(article);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!articleToDelete) return;
		
		const success = await deleteItem(articleToDelete.id, {
			successMessage: "Artículo eliminado correctamente",
			errorMessage: "Error al eliminar el artículo",
		});
		
		if (success) {
			setDeleteDialogOpen(false);
			setArticleToDelete(null);
		}
	};

	const handleBulkDeleteClick = async () => {
		const success = await bulkDelete(selectedIds, {
			successMessage: "Elementos eliminados exitosamente",
			errorMessage: "Error al eliminar elementos",
		});
		
		if (success) {
			clearSelection();
		}
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case 'published':
				return <Badge className="bg-green-500">{"Publicado"}</Badge>;
			case 'draft':
				return <Badge variant="secondary">{"Borrador"}</Badge>;
			case 'archived':
				return <Badge variant="destructive">{"Archivado"}</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const renderActions = (article, isDropdown = false) => (
		<Can permission="edit articles">
			{isDropdown ? (
				<>
					<DropdownMenuItem onClick={() => navigate(`/articulos/editar/${article.id}`)}>
						<Edit className="mr-2 h-4 w-4" /> {"Editar"}
					</DropdownMenuItem>
					<Can permission="delete articles">
						<DropdownMenuItem onClick={() => handleDeleteClick(article)} className="text-red-500">
							<Trash2 className="mr-2 h-4 w-4" /> {"Eliminar"}
						</DropdownMenuItem>
					</Can>
				</>
			) : (
				<>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => {
							setPreviewArticle(article);
							setPreviewOpen(true);
						}}
						title={`Ver artículo ${article.title}`}
						aria-label={`Ver artículo ${article.title}`}
					>
						<Eye className="h-4 w-4" />
					</Button>
					<Can permission="edit articles">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => navigate(`/articulos/editar/${article.id}`)}
							title={`Editar artículo ${article.title}`}
							aria-label={`Editar artículo ${article.title}`}
						>
							<Edit className="h-4 w-4" />
						</Button>
					</Can>
					<Can permission="delete articles">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-red-500"
							onClick={() => handleDeleteClick(article)}
							title={`Eliminar artículo ${article.title}`}
							aria-label={`Eliminar artículo ${article.title}`}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</Can>
				</>
			)}
		</Can>
	);

	return (
		<div className="space-y-6">
			<PageHeader
				title={"Artículos"}
				breadcrumbs={[
					{ label: 'BLOG' },
					{ label: "Artículos" },
				]}
			/>

			<Card>
				<CardHeader className="flex flex-row items-center justify-start gap-2">
					<Can permission="create articles">
						<Button asChild>
							<Link to="/articulos/crear">
								<Plus className="mr-2 h-4 w-4" /> {"Crear Artículo"}
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
									placeholder={"Buscar artículos..."}
									className="pl-8"
									value={filters.search}
									onChange={(e) => setFilter('search', e.target.value)}
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
									<label htmlFor="filterCategory" className="text-sm font-medium">{"Categoría"}</label>
									<select
										id="filterCategory"
										className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										value={filters.category_id}
										onChange={(e) => setFilter('category_id', e.target.value)}
									>
										<option value="">{"Todas las Categorías"}</option>
										{categories.map((category) => (
											<option key={category.id} value={category.id}>
												{category.name}
											</option>
										))}
									</select>
								</div>
								<div className="space-y-2">
									<label htmlFor="filterStatus" className="text-sm font-medium">{"Estado"}</label>
									<select
										id="filterStatus"
										className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										value={filters.status}
										onChange={(e) => setFilter('status', e.target.value)}
									>
										<option value="">{"Todos los Estados"}</option>
										<option value="draft">{"Borrador"}</option>
										<option value="published">{"Publicado"}</option>
										<option value="archived">{"Archivado"}</option>
									</select>
								</div>
							</div>
							<div className="flex justify-end">
								<Button
									variant="ghost"
									size="sm"
									onClick={clearFilters}
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
										{"ID"} 
										{sortBy === 'id' ? (
											sortDir === 'asc' ? <ChevronDown className="ml-2 h-4 w-4 rotate-180" /> : <ChevronDown className="ml-2 h-4 w-4" />
										) : <ChevronDown className="ml-2 h-4 w-4 opacity-50" />}
									</div>
								</TableHead>
								<TableHead>{"Imagen de Portada"}</TableHead>
								<TableHead
									className="cursor-pointer select-none"
									onClick={() => handleSort("title")}
								>
									<div className="flex items-center">
										{"Título"}
										{sortBy === 'title' ? (
											sortDir === 'asc' ? <ChevronDown className="ml-2 h-4 w-4 rotate-180" /> : <ChevronDown className="ml-2 h-4 w-4" />
										) : <ChevronDown className="ml-2 h-4 w-4 opacity-50" />}
									</div>
								</TableHead>
								<TableHead>{"Categoría"}</TableHead>
								<TableHead>{"Estado"}</TableHead>
								<TableHead className="cursor-pointer select-none w-[120px]" onClick={() => handleSort("featured")}>
									<div className="flex items-center">
										{"Dest/Ord"}
										{sortBy === 'featured' ? (
											sortDir === 'asc' ? <ChevronDown className="ml-2 h-4 w-4 rotate-180" /> : <ChevronDown className="ml-2 h-4 w-4" />
										) : <ChevronDown className="ml-2 h-4 w-4 opacity-50" />}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer select-none text-right w-[130px]"
									onClick={() => handleSort("created_at")}
								>
									<div className="flex items-center justify-end">
										{"Creado el"}
										{sortBy === 'created_at' ? (
											sortDir === 'asc' ? <ChevronDown className="ml-2 h-4 w-4 rotate-180" /> : <ChevronDown className="ml-2 h-4 w-4" />
										) : <ChevronDown className="ml-2 h-4 w-4 opacity-50" />}
									</div>
								</TableHead>
								<TableHead data-sticky="right" className="text-right w-[150px]">{"Acciones"}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className={loading ? "opacity-50 pointer-events-none" : ""}>
							{loading && articles.length === 0 && (
								<TableRow>
									<TableCell colSpan={9} className="text-center">
										{"Cargando..."}
									</TableCell>
								</TableRow>
							)}
							{!loading && articles.length === 0 && (
								<TableRow>
									<TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
										{"No se encontraron datos."}
									</TableCell>
								</TableRow>
							)}
							{articles.map((article) => (
								<TableRow key={article.id}>
									<TableCell>
										<Checkbox
											checked={selectedIds.includes(article.id)}
											onCheckedChange={() => toggleSelect(article.id)}
										/>
									</TableCell>
									<TableCell className="w-[60px]">{article.id}</TableCell>
									<TableCell>
										{article.cover_url ? (
											<img
												src={article.cover_url}
												alt={article.title}
												className="h-10 w-10 object-cover rounded shadow-sm"
											/>
										) : (
											<div className="h-10 w-10 bg-muted flex items-center justify-center rounded">
												<ImageIcon className="h-5 w-5 text-muted-foreground" />
											</div>
										)}
									</TableCell>
									<TableCell className="font-medium">{article.title}</TableCell>
									<TableCell>{article.category?.name}</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-full justify-start px-2">
													{getStatusBadge(article.status)}
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="start">
												<DropdownMenuItem onClick={() => handleStatusChange(article, 'draft')}>
													{"Borrador"}
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleStatusChange(article, 'published')}>
													{"Publicado"}
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleStatusChange(article, 'archived')}>
													{"Archivado"}
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
									<TableCell className="w-[120px]">
										<div className="flex items-center gap-2">
											<button
												onClick={() => handleToggleFeatured(article)}
												className="focus:outline-none"
											>
												{article.featured ? (
													<Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0 cursor-pointer hover:scale-110 transition-transform" />
												) : (
													<Star className="h-4 w-4 text-muted-foreground/30 shrink-0 cursor-pointer hover:scale-110 transition-transform" />
												)}
											</button>
											<Input
												type="number"
												className="h-7 w-16 text-sm"
												value={article.order ?? 0}
												onChange={(e) => handleOrderChange(article.id, e.target.value)}
											/>
										</div>
									</TableCell>
									<TableCell className="text-right w-[130px]">{formatDate(article.created_at)}</TableCell>
									<TableCell data-sticky="right" className="text-right w-[150px]">
										<div className="flex items-center justify-end gap-1">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon" className="h-10 w-10 lg:hidden">
														<ChevronDown className="h-5 w-5" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onClick={() => { setPreviewArticle(article); setPreviewOpen(true); }}>
														<Eye className="mr-2 h-4 w-4" /> {"Ver"}
													</DropdownMenuItem>
													{renderActions(article, true)}
												</DropdownMenuContent>
											</DropdownMenu>
											<div className="hidden lg:flex items-center gap-1">
												{renderActions(article, false)}
											</div>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					</AdminTableShell>

					<CrudPagination
						meta={meta}
						page={page}
						onPageChange={setPage}
						prevLabel={"Anterior"}
						nextLabel={"Siguiente"}
					/>

					{previewOpen && previewArticle && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPreviewOpen(false)}>
							<div className="bg-background rounded-lg shadow-xl w-full max-w-3xl mx-4 p-4" onClick={(e) => e.stopPropagation()}>
								<ArticlePreview article={previewArticle} onClose={() => setPreviewOpen(false)} />
							</div>
						</div>
					)}

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
