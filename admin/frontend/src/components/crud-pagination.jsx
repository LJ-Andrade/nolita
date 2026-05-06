import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable CRUD Pagination component
 * Displays page numbers with previous/next navigation
 * 
 * @param {Object} props
 * @param {Object} props.meta - Pagination metadata from API { current_page, last_page, ... }
 * @param {number} props.page - Current page number
 * @param {Function} props.onPageChange - Handler for page change (page) => void
 * @param {string} props.prevLabel - Label for previous button
 * @param {string} props.nextLabel - Label for next button
 */
export function CrudPagination({
  meta,
  page,
  onPageChange,
  prevLabel = 'Previous',
  nextLabel = 'Next'
}) {
  if (!meta.last_page || meta.last_page <= 1) {
    return null;
  }

  const renderPages = () => {
    const pages = [];
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(meta.last_page, startPage + 4);
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
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        {prevLabel}
      </Button>
      <div className="flex items-center space-x-1">
        {renderPages()}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === meta.last_page}
      >
        {nextLabel}
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
