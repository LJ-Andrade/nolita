import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/lib/axios';
import { toast } from 'sonner';
import { useBulkSelect } from './use-bulk-select';

/**
 * Hook for CRUD list operations
 * Handles fetching, pagination, sorting, filtering, and bulk operations
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.endpoint - API endpoint (e.g., 'product-categories')
 * @param {Object} config.defaultSort - Default sort configuration { column: 'id', direction: 'desc' }
 * @param {string[]} config.filterKeys - Array of filter keys to manage (e.g., ['search', 'filter_id'])
 * @param {number} config.debounceMs - Debounce delay in milliseconds (default: 500)
 * @returns {Object} CRUD operations and state
 */
export function useCrudList({
  endpoint,
  defaultSort = { column: 'id', direction: 'desc' },
  filterKeys = ['search'],
  debounceMs = 500
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  
  // Sort state
  const [sortBy, setSortBy] = useState(defaultSort.column);
  const [sortDir, setSortDir] = useState(defaultSort.direction);
  
  // Filter states - dynamically created based on filterKeys
  const [filters, setFilters] = useState(() => {
    const initial = {};
    filterKeys.forEach(key => {
      initial[key] = '';
    });
    return initial;
  });
  
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  
  // Bulk selection
  const {
    selectedIds,
    selectedCount,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isSelected
  } = useBulkSelect(items);

  // Debounce filters
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [filters, debounceMs]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedFilters]);

  // Clear selection when data changes
  useEffect(() => {
    clearSelection();
  }, [page, debouncedFilters, sortBy, sortDir, clearSelection]);

  // Fetch items
  const fetchItems = useCallback(({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    
    const params = {
      page,
      sort_by: sortBy,
      sort_dir: sortDir,
      ...Object.entries(debouncedFilters).reduce((acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      }, {})
    };

    axiosClient
      .get(endpoint, { params })
      .then(({ data }) => {
        setItems(Array.isArray(data) ? data : data.data || []);
        setMeta(data.meta || {});
        if (!silent) setLoading(false);
      })
      .catch((error) => {
        console.error(`Error fetching ${endpoint}:`, error);
        if (!silent) setLoading(false);
      });
  }, [endpoint, page, sortBy, sortDir, debouncedFilters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Sort handler
  const handleSort = useCallback((column) => {
    if (sortBy === column) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  }, [sortBy]);

  // Filter handlers
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    const cleared = {};
    filterKeys.forEach(key => {
      cleared[key] = '';
    });
    setFilters(cleared);
    setPage(1);
  }, [filterKeys]);

  // Delete single item
  const deleteItem = useCallback(async (id, options = {}) => {
    const { 
      successMessage = 'Item deleted successfully',
      errorMessage = 'Error deleteting item'
    } = options;
    
    try {
      await axiosClient.delete(`${endpoint}/${id}`);
      toast.success(successMessage);
      fetchItems();
      return true;
    } catch (error) {
      toast.error(errorMessage);
      console.error('Delete error:', error);
      return false;
    }
  }, [endpoint, fetchItems]);

  // Bulk delete
  const bulkDelete = useCallback(async (ids, options = {}) => {
    const {
      successMessage = `${ids.length} items deleted successfully`,
      errorMessage = 'Error deleteting items'
    } = options;

    try {
      await axiosClient.post(`${endpoint}/bulk-delete`, { ids });
      toast.success(successMessage);
      clearSelection();
      fetchItems();
      return true;
    } catch (error) {
      toast.error(errorMessage);
      console.error('Bulk delete error:', error);
      return false;
    }
  }, [endpoint, fetchItems, clearSelection]);

  return {
    // Data
    items,
    loading,
    meta,
    
    // Pagination
    page,
    setPage,
    
    // Sorting
    sortBy,
    sortDir,
    handleSort,
    
    // Filtering
    filters,
    debouncedFilters,
    setFilter,
    clearFilters,
    
    // Selection
    selectedIds,
    selectedCount,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isSelected,
    
    // Actions
    fetchItems,
    refresh: () => fetchItems({ silent: true }),
    deleteItem,
    bulkDelete
  };
}
