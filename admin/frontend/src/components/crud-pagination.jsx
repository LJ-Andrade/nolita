import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Reusable CRUD Pagination component
 * Displays page numbers with previous/next navigation
 *
 * @param {Object} props
 * @param {Object} props.meta - Pagination metadata from API { current_page, last_page, ... }
 * @param {number} props.page - Current page number
 * @param {Function} props.onPageChange - Handler for page change (page) => void
 * @param {number} props.perPage - Current rows per page value
 * @param {Function} props.onPerPageChange - Handler for rows per page change (perPage) => void
 * @param {number[]} props.perPageOptions - Selectable rows per page values
 * @param {string} props.prevLabel - Label for previous button
 * @param {string} props.nextLabel - Label for next button
 */
export function CrudPagination({
  meta,
  page,
  onPageChange,
  perPage,
  onPerPageChange,
  perPageOptions = [10, 20],
  prevLabel = 'Previous',
  nextLabel = 'Next'
}) {
  const lastPage = meta.last_page || 1;
  const currentPerPage = perPage ?? meta.per_page;
  const canChangePerPage = typeof onPerPageChange === 'function';

  if (lastPage <= 1 && !canChangePerPage) {
    return null;
  }

  const renderPages = () => {
    const pages = [];
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(lastPage, startPage + 4);
    const adjustedStartPage = Math.max(1, endPage - 4);

    for (let i = adjustedStartPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={page === i ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(i)}
        >
          {i}
        </Button>
      );
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      {canChangePerPage ? (
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Mostrar</span>
          <select
            value={currentPerPage}
            onChange={(event) => onPerPageChange(Number(event.target.value))}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
          >
            {perPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span>por página</span>
        </label>
      ) : (
        <div />
      )}

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="Primera página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label={prevLabel}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {lastPage > 1 && (
          <div className="flex items-center space-x-1">
            {renderPages()}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === lastPage}
          aria-label={nextLabel}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(lastPage)}
          disabled={page === lastPage}
          aria-label="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
