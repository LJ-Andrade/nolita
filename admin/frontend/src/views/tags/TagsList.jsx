import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

export default function TagsList() {
  const navigate = useNavigate();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);

  const {
    items: tags,
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
    endpoint: 'tags',
    filterKeys: ['search', 'filter_id', 'filter_name'],
    defaultSort: { column: 'id', direction: 'desc' },
  });

  const columns = [
    { key: 'id', label: "ID", sortable: true, width: 'w-[60px]' },
    { key: 'name', label: "Nombre", sortable: true },
    { key: 'slug', label: "Slug", sortable: true },
    { key: 'created_at', label: "Creado el" || 'Creado', sortable: true, align: 'right', width: 'w-[130px]', format: 'date' },
  ];

  const handleDeleteClick = (tag) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tagToDelete) return;
    
    const success = await deleteItem(tagToDelete.id, {
      successMessage: "Etiqueta eliminada correctamente",
      errorMessage: "Error al eliminar la etiqueta",
    });
    
    if (success) {
      setDeleteDialogOpen(false);
      setTagToDelete(null);
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

  const renderActions = (tag, isDropdown = false) => (
    <Can permission="manage tags">
      {isDropdown ? (
        <>
          <DropdownMenuItem onClick={() => navigate(`/etiquetas/editar/${tag.id}`)}>
            <Edit className="mr-2 h-4 w-4" /> {"Editar"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDeleteClick(tag)} className="text-red-500">
            <Trash2 className="mr-2 h-4 w-4" /> {"Eliminar"}
          </DropdownMenuItem>
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(`/etiquetas/editar/${tag.id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500"
            onClick={() => handleDeleteClick(tag)}
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
        title={"Etiquetas"}
        breadcrumbs={[
          { label: 'BLOG' },
          { label: "Etiquetas" },
        ]}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-start gap-2">
          <Can permission="manage tags">
            <Button asChild>
              <Link to="/etiquetas/crear">
                <Plus className="mr-2 h-4 w-4" /> {"Crear Etiqueta"}
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
                  placeholder={"Buscar etiquetas..."}
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => setFilter('search', e.target.value)}
                />
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  {"Búsqueda Avanzada"}
                  <ChevronDown
                    className={`ml-2 h-4 w-4 transition-transform ${
                      isFiltersOpen ? 'rotate-180' : ''
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
                  <label htmlFor="filterName" className="text-sm font-medium">
                    {"Nombre"}
                  </label>
                  <Input
                    id="filterName"
                    placeholder={"Nombre"}
                    value={filters.filter_name}
                    onChange={(e) => setFilter('filter_name', e.target.value)}
                  />
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

          <CrudTable
            items={tags}
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
