import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminTableShell } from "@/components/admin-table-shell";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { formatDate } from "@/lib/utils";

/**
 * Reusable CRUD Table component
 * Supports sorting, selection, custom columns, and row actions
 *
 * @param {Object} props
 * @param {Array} props.items - Data items to display
 * @param {Array} props.columns - Column definitions
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.selectable - Enable row selection
 * @param {Array} props.selectedIds - Currently selected IDs
 * @param {boolean} props.isAllSelected - Whether all items are selected
 * @param {Function} props.onSelectt - Handler for row selection (id) => void
 * @param {Function} props.onSelecttAll - Handler for select all () => void
 * @param {string} props.sortBy - Current sort column
 * @param {string} props.sortDir - Current sort direction ('asc' | 'desc')
 * @param {Function} props.onSortt - Handler for sort (column) => void
 * @param {Function} props.actions - Render function for row actions (item) => ReactNode
 * @param {string} props.emptyMessage - Message when no data
 * @param {string} props.loadingMessage - Message when loading
 */
export function CrudTable({
  items,
  columns,
  loading = false,
  selectable = true,
  selectedIds = [],
  isAllSelected = false,
  onSelectt,
  onSelecttAll,
  sortBy,
  sortDir,
  onSortt,
  actions,
  emptyMessage = "No data available",
  loadingMessage = "Loading...",
}) {
  const renderSortIcon = (column) => {
    if (sortBy !== column.key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDir === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const renderCell = (item, column) => {
    const value = item[column.key];

    if (column.format === "date") {
      return formatDate(value);
    }

    if (column.render) {
      return column.render(value, item);
    }

    return value;
  };

  const colSpan = columns.length + (selectable ? 2 : 1);

  return (
    <AdminTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-10">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelecttAll}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={`
                ${column.sortable ? "cursor-pointer select-none" : ""}
                ${column.width ? column.width : ""}
                ${column.align === "right" ? "text-right" : ""}
              `}
                onClick={() =>
                  column.sortable && onSortt && onSortt(column.key)
                }
              >
                <div
                  className={`flex items-center ${column.align === "right" ? "justify-end" : ""}`}
                >
                  {column.label}
                  {column.sortable && renderSortIcon(column)}
                </div>
              </TableHead>
            ))}
            <TableHead data-sticky="right" className="text-right w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={loading ? "opacity-50 pointer-events-none" : ""}>
          {loading && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={colSpan} className="text-center">
                {loadingMessage}
              </TableCell>
            </TableRow>
          )}
          {!loading && items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={colSpan}
                className="text-center py-8 text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
          {items.map((item) => (
            <TableRow key={item.id} className="h-10">
              {selectable && (
                <TableCell className="py-2">
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={() => onSelectt && onSelectt(item.id)}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={`
                  py-2
                  ${column.align === "right" ? "text-right" : ""}
                  ${column.key === "name" ? "font-medium" : ""}
                `}
                >
                  {renderCell(item, column)}
                </TableCell>
              ))}
              <TableCell data-sticky="right" className="text-right py-2 w-[120px]">
                <div className="flex items-center justify-end gap-1">
                  {actions && (
                    <>
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
                          {actions(item, true)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="hidden lg:flex items-center gap-1">
                        {actions(item, false)}
                      </div>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminTableShell>
  );
}
