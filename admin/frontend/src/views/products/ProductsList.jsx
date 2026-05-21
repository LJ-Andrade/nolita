import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Fragment,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { getMediaUrl } from "@/lib/media-url";
import { formatDate } from "@/lib/utils";
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
  Star,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
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
import { CrudInlineOrderEditor } from "@/components/crud-inline-order-editor";
import { AdminTableShell } from "@/components/admin-table-shell";

export default function ProductsList() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [expandedProductId, setExpandedProductId] = useState(null);
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
    filterKeys: ["search", "category_id", "status"],
    defaultSort: { column: "id", direction: "desc" },
  });

  // Fetch categories for filter dropdown
  useEffect(() => {
    axiosClient.get("product-categories?all=1").then(({ data }) => {
      setCategories(data.data || []);
    });
  }, []);

  const quickUpdate = useCallback(
    (id, field, value) => {
      const previousProducts = [...products];

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
    [products, fetchItems],
  );

  const handleToggleFeatured = (product) => {
    quickUpdate(product.id, "featured", !product.featured);
  };

  const handleStatusChange = (product, newStatus) => {
    quickUpdate(product.id, "status", newStatus);
  };

  const hasVariantChanges = useMemo(() => {
    return Object.keys(variantChanges).length > 0;
  }, [variantChanges]);

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

  const toggleExpandProduct = (productId) => {
    setExpandedProductId((prev) => (prev === productId ? null : productId));
    setVariantChanges({});
  };

  const getVariantChangesForProduct = (productId) => {
    return variantChanges[productId] || {};
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

  const saveProductOrder = async (productId, order) => {
    await axiosClient.patch(`/products/${productId}/quick-update`, { order });
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={"Productos"}
        breadcrumbs={[{ label: "TIENDA" }, { label: "Productos" }]}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-start gap-2">
          <Can permission="create products">
            <Button asChild>
              <Link to="/productos/crear">
                <Plus className="mr-2 h-4 w-4" /> {"Crear Producto"}
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
                  placeholder={"Buscar productos..."}
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

            <CollapsibleContent className="space-y-4 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
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
                    <option value="archived">{"Archivado"}</option>
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
          </Collapsible>

          {/* Custom table for products with special features */}
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
                  <TableHead>{"Portada"}</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      {"Nombre"} {renderSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead>{"Categoría"}</TableHead>
                  <TableHead>{"Precio Minorista"}</TableHead>
                  <TableHead>{"Precio Mayorista"}</TableHead>
                  <TableHead>{"Estado"}</TableHead>
                  <TableHead
                    className="cursor-pointer select-none w-[120px]"
                    onClick={() => handleSort("featured")}
                  >
                    <div className="flex items-center">
                      {"Destacado"} {renderSortIcon("featured")}
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
                  <TableHead className="text-right w-[150px]">
                    {"Acciones"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody
                className={loading ? "opacity-50 pointer-events-none" : ""}
              >
                {loading && products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center">
                      {"Cargando..."}
                    </TableCell>
                  </TableRow>
                )}
                {!loading && products.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={11}
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
                      <TableCell className="w-[60px]">{product.id}</TableCell>
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
                        {product.name}
                      </TableCell>
                      <TableCell>{product.category?.name}</TableCell>
                      <TableCell>
                        <div className="font-medium">{product.sale_price}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {product.wholesale_price}
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
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(product, "archived")
                              }
                            >
                              {"Archivado"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleFeatured(product)}
                            className="focus:outline-none"
                          >
                            {product.featured ? (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0 cursor-pointer hover:scale-110 transition-transform" />
                            ) : (
                              <Star className="h-4 w-4 text-muted-foreground/30 shrink-0 cursor-pointer hover:scale-110 transition-transform" />
                            )}
                          </button>
                          <CrudInlineOrderEditor
                            value={product.order}
                            onSave={(order) =>
                              saveProductOrder(product.id, order)
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right w-[130px]">
                        {formatDate(product.created_at)}
                      </TableCell>
                      <TableCell className="text-right w-[150px]">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer"
                            onClick={() => toggleExpandProduct(product.id)}
                            title={"Ver variantes"}
                          >
                            <ChevronRight
                              className={`h-4 w-4 transition-transform ${expandedProductId === product.id ? "rotate-90" : ""}`}
                            />
                          </Button>
                          <Can permission="view products">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer"
                              onClick={() =>
                                navigate(`/productos/${product.id}`)
                              }
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
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Can>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedProductId === product.id &&
                      product.variants &&
                      product.variants.length > 0 && (
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={10} className="p-4">
                            <div className="space-y-3">
                              <div className="max-w-3xl ml-auto">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium text-sm">
                                    {"Talles, colores y variantes"}
                                  </h4>
                                </div>
                                <Table className="border rounded-lg">
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="w-[100px] text-left">
                                        {"SKU"}
                                      </TableHead>
                                      <TableHead className="text-left">
                                        {"Color"}
                                      </TableHead>
                                      <TableHead className="text-left">
                                        {"Talle"}
                                      </TableHead>
                                      <TableHead className="text-right">
                                        {"Stock"}
                                      </TableHead>
                                      <TableHead className="text-right">
                                        {"Stock Mínimo"}
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {product.variants.map((variant) => {
                                      const changes =
                                        getVariantChangesForProduct(product.id);
                                      const hasChanges =
                                        changes && changes[variant.id];
                                      return (
                                        <TableRow
                                          key={variant.id}
                                          className={
                                            hasChanges
                                              ? "bg-yellow-50 dark:bg-yellow-900/30"
                                              : ""
                                          }
                                        >
                                          <TableCell className="w-[100px]">
                                            <Input
                                              className="h-8 text-sm"
                                              value={
                                                hasChanges
                                                  ? (changes[variant.id].sku ??
                                                    variant.sku)
                                                  : (variant.sku ?? "")
                                              }
                                              onChange={(e) =>
                                                handleVariantFieldChange(
                                                  product.id,
                                                  variant.id,
                                                  "sku",
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="-"
                                            />
                                          </TableCell>
                                          <TableCell className="text-left">
                                            <div className="flex items-center gap-2">
                                              {variant.color?.hex_color && (
                                                <span
                                                  className="h-4 w-4 rounded-full border shrink-0"
                                                  style={{
                                                    backgroundColor:
                                                      variant.color.hex_color,
                                                  }}
                                                />
                                              )}
                                              <span>
                                                {variant.color?.name || "-"}
                                              </span>
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-left">
                                            {variant.size?.name || "-"}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <div className="flex justify-end">
                                              <Input
                                                type="number"
                                                className="h-8 w-[80px] text-sm text-right"
                                                value={
                                                  hasChanges
                                                    ? (changes[variant.id]
                                                        .stock ?? variant.stock)
                                                    : (variant.stock ?? 0)
                                                }
                                                onChange={(e) =>
                                                  handleVariantFieldChange(
                                                    product.id,
                                                    variant.id,
                                                    "stock",
                                                    parseInt(e.target.value) ||
                                                      0,
                                                  )
                                                }
                                              />
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <div className="flex justify-end">
                                              <Input
                                                type="number"
                                                className="h-8 w-[80px] text-sm text-right"
                                                value={
                                                  hasChanges
                                                    ? (changes[variant.id]
                                                        .min_stock ??
                                                      variant.min_stock)
                                                    : (variant.min_stock ?? 0)
                                                }
                                                onChange={(e) =>
                                                  handleVariantFieldChange(
                                                    product.id,
                                                    variant.id,
                                                    "min_stock",
                                                    parseInt(e.target.value) ||
                                                      0,
                                                  )
                                                }
                                              />
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                              {(() => {
                                const changes = getVariantChangesForProduct(
                                  product.id,
                                );
                                const hasChanges =
                                  changes && Object.keys(changes).length > 0;
                                return hasChanges ? (
                                  <div className="flex justify-end mt-3">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleSaveVariants(product.id)
                                      }
                                      disabled={savingVariantId === product.id}
                                    >
                                      {savingVariantId === product.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                      ) : (
                                        <Check className="h-4 w-4 mr-1" />
                                      )}
                                      {"Guardar"}
                                    </Button>
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
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
      </Card>
    </div>
  );
}
