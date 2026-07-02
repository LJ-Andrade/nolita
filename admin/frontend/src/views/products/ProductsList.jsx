import React, { useEffect, useState, useCallback, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { getMediaUrl } from "@/lib/media-url";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  Loader2,
} from "lucide-react";
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
import { AdminTableShell } from "@/components/admin-table-shell";

const PRODUCT_FILTERS_OPEN_STORAGE_KEY = "admin.products.filtersOpen";
const PRODUCT_LIST_FILTERS_STORAGE_KEY = "admin.products.filters";
const PRODUCT_LIST_RETURN_URL_KEY = "admin.products.lastListUrl";

export default function ProductsList() {
  const navigate = useNavigate();

  // Restore filters/pagination from the last visit when arriving with a bare URL
  // (e.g. navigating here from another section), so the list state isn't lost.
  if (typeof window !== "undefined" && !window.location.search) {
    try {
      const savedUrl = window.sessionStorage.getItem(
        PRODUCT_LIST_RETURN_URL_KEY,
      );
      const savedSearch = savedUrl?.includes("?")
        ? savedUrl.slice(savedUrl.indexOf("?"))
        : "";
      if (savedSearch) {
        window.history.replaceState(
          {},
          "",
          window.location.pathname + savedSearch,
        );
      }
    } catch {
      /* ignore */
    }
  }

  const [categories, setCategories] = useState([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(() => {
    if (typeof window === "undefined") return false;

    return (
      window.localStorage.getItem(PRODUCT_FILTERS_OPEN_STORAGE_KEY) === "true"
    );
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [variantChanges, setVariantChanges] = useState({});
  const [savingVariantId, setSavingVariantId] = useState(null);

  const {
    items: products,
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
  } = useCrudList({
    endpoint: "products",
    filterKeys: ["search", "category_id", "status", "mode"],
    defaultSort: { column: "created_at", direction: "desc" },
    storageKey: PRODUCT_LIST_FILTERS_STORAGE_KEY,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      PRODUCT_FILTERS_OPEN_STORAGE_KEY,
      isFiltersOpen ? "true" : "false",
    );
  }, [isFiltersOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(
        PRODUCT_LIST_RETURN_URL_KEY,
        window.location.pathname + window.location.search,
      );
    } catch {
      /* ignore */
    }
  }, [page, sortBy, sortDir, filters]);

  // Fetch categories for filter dropdown
  useEffect(() => {
    axiosClient.get("product-categories?all=1").then(({ data }) => {
      setCategories(data.data || []);
    });
  }, []);

  const quickUpdate = useCallback(
    (id, field, value) => {
      axiosClient
        .patch(`/products/${id}/quick-update`, { [field]: value })
        .then(() => {
          toast.success("Producto actualizado correctamente");
          fetchItems();
        })
        .catch((error) => {
          toast.error("Ocurrió un error");
          console.error(error);
        });
    },
    [fetchItems],
  );

  const handleStatusChange = (product, newStatus) => {
    quickUpdate(product.id, "status", newStatus);
  };

  const handleVariantFieldChange = (productId, variantId, field, value) => {
    setVariantChanges((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [variantId]: {
          ...(prev[productId]?.[variantId] || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleSaveVariants = async (productId) => {
    const changes = variantChanges[productId];
    if (!changes) return;

    setSavingVariantId(productId);

    try {
      const updatePromises = Object.entries(changes).map(
        ([variantId, fields]) => {
          return axiosClient.patch(
            `/products/${productId}/variants/${variantId}`,
            fields,
          );
        },
      );

      await Promise.all(updatePromises);
      toast.success("Producto actualizado correctamente");
      setVariantChanges((prev) => {
        const newChanges = { ...prev };
        delete newChanges[productId];
        return newChanges;
      });
      fetchItems();
    } catch (error) {
      toast.error("Ocurrió un error");
      console.error(error);
    } finally {
      setSavingVariantId(null);
    }
  };

  const getVariantChangesForProduct = (productId) => {
    return variantChanges[productId] || {};
  };

  const getVariantFieldValue = (productId, variant, field, fallback = "") => {
    const changes = getVariantChangesForProduct(productId);
    if (changes?.[variant.id] && field in changes[variant.id]) {
      return changes[variant.id][field];
    }

    return variant[field] ?? fallback;
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">{"Publicado"}</Badge>;
      case "draft":
        return <Badge variant="secondary">{"Borrador"}</Badge>;
      case "archived":
        return <Badge variant="destructive">{"Archivado"}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPrice = (value) => {
    const numericValue = Number(value ?? 0);

    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getRetailDiscount = (product) => Number(product.discount ?? 0);
  const getWholesaleDiscount = (product) =>
    Number(product.wholesale_discount ?? 0);

  const getRetailFinalPrice = (product) => {
    const salePrice = Number(product.sale_price ?? 0);
    const discount = getRetailDiscount(product);

    return salePrice * (1 - discount / 100);
  };

  const getWholesaleFinalPrice = (product) => {
    const wholesalePrice = Number(product.wholesale_price ?? 0);
    const discount = getWholesaleDiscount(product);

    return wholesalePrice * (1 - discount / 100);
  };

  const onDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    const success = await deleteItem(productToDelete.id, {
      successMessage: "Producto eliminado correctamente",
      errorMessage: "Error al eliminar el producto",
    });

    if (success) {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleBulkDeleteClick = async () => {
    const success = await bulkDelete(selectedIds, {
      successMessage: "Elementos eliminados exitosamente",
      errorMessage: "Error al eliminar elementos",
    });

    if (success) clearSelection();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={"Productos"}
        breadcrumbs={[{ label: "TIENDA" }, { label: "Productos" }]}
      />

      <Card>
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Can permission="create products">
              <Button asChild>
                <Link to="/productos/crear">
                  <Plus className="mr-2 h-4 w-4" /> {"Crear Producto"}
                </Link>
              </Button>
            </Can>
            <div className="flex items-center gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={"Buscar por nombre o código..."}
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => setFilter("search", e.target.value)}
                />
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  {"Búsqueda Avanzada"}
                  <ChevronDown
                    className={`ml-2 h-4 w-4 transition-transform ${isFiltersOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CardContent>
            <CollapsibleContent className="space-y-4 pb-4 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label
                    htmlFor="filterCategory"
                    className="text-sm font-medium"
                  >
                    {"Categoría"}
                  </label>
                  <select
                    id="filterCategory"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={filters.category_id}
                    onChange={(e) => setFilter("category_id", e.target.value)}
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
                  <label htmlFor="filterMode" className="text-sm font-medium">
                    {"Canal"}
                  </label>
                  <select
                    id="filterMode"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={filters.mode}
                    onChange={(e) => setFilter("mode", e.target.value)}
                  >
                    <option value="">{"Todos"}</option>
                    <option value="retail">{"Minorista"}</option>
                    <option value="wholesale">{"Mayorista"}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="filterStatus" className="text-sm font-medium">
                    {"Estado"}
                  </label>
                  <select
                    id="filterStatus"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={filters.status}
                    onChange={(e) => setFilter("status", e.target.value)}
                  >
                    <option value="">{"Todos los Estados"}</option>
                    <option value="draft">{"Borrador"}</option>
                    <option value="published">{"Publicado"}</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  {"Limpiar Filtros"}
                </Button>
              </div>
            </CollapsibleContent>

            {/* Custom table for products with special features */}
            <AdminTableShell topScrollbar>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>{"Portada"}</TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        {"Nombre"} {renderSortIcon("name")}
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[320px]">
                      {"Variantes / Stock"}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("sale_price")}
                    >
                      <div className="flex items-center">
                        {"Precio Minorista"} {renderSortIcon("sale_price")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("discount")}
                    >
                      <div className="flex items-center">
                        {"% Desc."} {renderSortIcon("discount")}
                      </div>
                    </TableHead>
                    <TableHead>{"Precio Final"}</TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("wholesale_price")}
                    >
                      <div className="flex items-center">
                        {"Precio Mayorista"} {renderSortIcon("wholesale_price")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("wholesale_discount")}
                    >
                      <div className="flex items-center">
                        {"% Desc."} {renderSortIcon("wholesale_discount")}
                      </div>
                    </TableHead>
                    <TableHead>{"Precio Final"}</TableHead>
                    <TableHead>{"Estado"}</TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("created_at")}
                    >
                      <div className="flex items-center">
                        {"Creado"} {renderSortIcon("created_at")}
                      </div>
                    </TableHead>
                    <TableHead
                      data-sticky="right"
                      className="text-right w-[150px]"
                    >
                      {"Acciones"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody
                  className={loading ? "opacity-50 pointer-events-none" : ""}
                >
                  {loading && products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center">
                        {"Cargando..."}
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && products.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={13}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {"No se encontraron datos."}
                      </TableCell>
                    </TableRow>
                  )}
                  {products.map((product) => (
                    <Fragment key={product.id}>
                      <TableRow>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(product.id)}
                            onCheckedChange={() => toggleSelect(product.id)}
                          />
                        </TableCell>
                        <TableCell>
                          {product.cover_url ? (
                            <img
                              src={getMediaUrl(product.cover_url)}
                              alt={product.name}
                              className="h-10 w-10 object-cover rounded shadow-sm"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-muted flex items-center justify-center rounded">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="space-y-1">
                            <div>{product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {product.code || "-"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          {product.variants && product.variants.length > 0 ? (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                {product.variants.map((variant) => {
                                  const stockValue = getVariantFieldValue(
                                    product.id,
                                    variant,
                                    "stock",
                                    0,
                                  );

                                  return (
                                    <Badge
                                      key={variant.id}
                                      variant="outline"
                                      className="h-auto gap-2 rounded-full border-border/80 bg-background px-2 py-1 text-xs font-normal"
                                    >
                                      <span className="inline-flex items-center gap-1.5 text-foreground">
                                        {variant.color?.hex_color && (
                                          <span
                                            className="h-2.5 w-2.5 rounded-full border border-border/80"
                                            style={{
                                              backgroundColor:
                                                variant.color.hex_color,
                                            }}
                                          />
                                        )}
                                        <span className="font-medium">
                                          {variant.size?.name || "Sin talle"}
                                        </span>
                                        <span className="text-muted-foreground">
                                          /
                                        </span>
                                        <span>
                                          {variant.color?.name || "Sin color"}
                                        </span>
                                      </span>
                                      <Input
                                        type="number"
                                        min="0"
                                        className="h-6 w-14 rounded-full border-border/80 bg-muted/40 px-2 text-center text-xs font-semibold"
                                        value={stockValue}
                                        onChange={(e) =>
                                          handleVariantFieldChange(
                                            product.id,
                                            variant.id,
                                            "stock",
                                            parseInt(e.target.value, 10) || 0,
                                          )
                                        }
                                      />
                                    </Badge>
                                  );
                                })}
                              </div>
                              {Object.keys(
                                getVariantChangesForProduct(product.id),
                              ).length > 0 && (
                                <div className="flex justify-start pt-1">
                                  <Button
                                    size="sm"
                                    className="min-w-[140px] border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:border-emerald-700"
                                    onClick={() =>
                                      handleSaveVariants(product.id)
                                    }
                                    disabled={savingVariantId === product.id}
                                  >
                                    {savingVariantId === product.id ? (
                                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    ) : (
                                      <Check className="mr-1 h-4 w-4" />
                                    )}
                                    {"Guardar stock"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {"Sin variantes"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatPrice(product.sale_price)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {getRetailDiscount(product)}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatPrice(getRetailFinalPrice(product))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatPrice(product.wholesale_price)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {getWholesaleDiscount(product)}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatPrice(getWholesaleFinalPrice(product))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-full justify-start px-2 cursor-pointer"
                              >
                                {getStatusBadge(product.status)}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(product, "draft")
                                }
                              >
                                {"Borrador"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(product, "published")
                                }
                              >
                                {"Publicado"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(product.created_at)}
                          </div>
                        </TableCell>
                        <TableCell
                          data-sticky="right"
                          className="text-right w-[150px]"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 lg:hidden"
                                >
                                  <ChevronDown className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Can permission="view products">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      navigate(`/productos/${product.id}`)
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> Ver
                                  </DropdownMenuItem>
                                </Can>
                                <Can permission="edit products">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      navigate(
                                        `/productos/editar/${product.id}`,
                                      )
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                  </DropdownMenuItem>
                                </Can>
                                <Can permission="delete products">
                                  <DropdownMenuItem
                                    onClick={() => onDeleteClick(product)}
                                    className="text-red-500"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                  </DropdownMenuItem>
                                </Can>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <div className="hidden lg:flex items-center gap-1">
                              <Can permission="view products">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 cursor-pointer"
                                  onClick={() =>
                                    navigate(`/productos/${product.id}`)
                                  }
                                  title={`Ver producto ${product.name}`}
                                  aria-label={`Ver producto ${product.name}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Can>
                              <Can permission="edit products">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 cursor-pointer"
                                  onClick={() =>
                                    navigate(`/productos/editar/${product.id}`)
                                  }
                                  title={`Editar producto ${product.name}`}
                                  aria-label={`Editar producto ${product.name}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Can>
                              <Can permission="delete products">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 cursor-pointer"
                                  onClick={() => onDeleteClick(product)}
                                  title={`Eliminar producto ${product.name}`}
                                  aria-label={`Eliminar producto ${product.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </Can>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </Fragment>
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

            <BulkActionsBar
              selectedCount={selectedCount}
              onDelete={handleBulkDeleteClick}
              onClear={clearSelection}
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
        </Collapsible>
      </Card>
    </div>
  );
}
