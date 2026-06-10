import { useState, useEffect, useCallback, useRef } from "react";
import axiosClient from "@/lib/axios";
import { toast } from "sonner";
import { useBulkSelect } from "./use-bulk-select";

function readQueryParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function pushQueryParams(params) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const qs = params.toString();
  url.search = qs ? "?" + qs : "";
  window.history.pushState({}, "", url.toString());
}

function replaceQueryParams(params) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const qs = params.toString();
  url.search = qs ? "?" + qs : "";
  window.history.replaceState({}, "", url.toString());
}

/**
 * Hook for CRUD list operations
 * Handles fetching, pagination, sorting, filtering, and bulk operations.
 * Synchronizes list state (page, sort, filters) with the URL via query params.
 *
 * @param {Object} config - Configuration object
 * @param {string} config.endpoint - API endpoint (e.g., 'product-categories')
 * @param {Object} config.defaultSort - Default sort configuration { column: 'id', direction: 'desc' }
 * @param {string[]} config.filterKeys - Array of filter keys to manage (e.g., ['search', 'filter_id'])
 * @param {number} config.debounceMs - Debounce delay in milliseconds (default: 500)
 * @param {string} config.storageKey - Optional localStorage key for filters (only used when syncUrl=false)
 * @param {boolean} config.syncUrl - Whether to sync list state with URL query params (default: true)
 * @returns {Object} CRUD operations and state
 */
export function useCrudList({
  endpoint,
  defaultSort = { column: "id", direction: "desc" },
  filterKeys = ["search"],
  debounceMs = 500,
  storageKey = null,
  syncUrl = true,
}) {
  const isSyncingFromUrl = useRef(false);
  const skipPageReset = useRef(false);
  const isInitialMount = useRef(true);

  function readIntParam(key, defaultValue) {
    const params = readQueryParams();
    const value = params.get(key);
    if (value === null) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  function readParam(key, defaultValue) {
    const params = readQueryParams();
    return params.get(key) ?? defaultValue;
  }

  function buildUrlParams(page, sortBy, sortDir, filters) {
    const p = new URLSearchParams();
    if (page !== 1) p.set("page", String(page));
    if (sortBy !== defaultSort.column) p.set("sort_by", sortBy);
    if (sortDir !== defaultSort.direction) p.set("sort_dir", sortDir);
    filterKeys.forEach((key) => {
      const value = filters[key];
      if (value) p.set(key, value);
    });
    return p;
  }

  const syncToUrl = useCallback(
    (page, sortBy, sortDir, filters) => {
      if (!syncUrl) return;
      isSyncingFromUrl.current = true;
      const next = buildUrlParams(page, sortBy, sortDir, filters);
      replaceQueryParams(next);
    },
    [syncUrl, defaultSort, filterKeys],
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({});

  const [page, setPage] = useState(() =>
    syncUrl ? readIntParam("page", 1) : 1,
  );
  const [sortBy, setSortBy] = useState(() =>
    syncUrl ? readParam("sort_by", defaultSort.column) : defaultSort.column,
  );
  const [sortDir, setSortDir] = useState(() =>
    syncUrl ? readParam("sort_dir", defaultSort.direction) : defaultSort.direction,
  );

  const [filters, setFilters] = useState(() => {
    const initial = {};
    filterKeys.forEach((key) => {
      if (syncUrl) {
        initial[key] = readParam(key, "");
      } else if (storageKey && typeof window !== "undefined") {
        try {
          const stored = JSON.parse(
            window.localStorage.getItem(storageKey) || "{}",
          );
          initial[key] = stored[key] !== undefined ? stored[key] : "";
        } catch {
          initial[key] = "";
        }
      } else {
        initial[key] = "";
      }
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
    isSelected,
  } = useBulkSelect(items);

  // Debounce filters
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, debounceMs);
    return () => clearTimeout(handler);
  }, [filters, debounceMs]);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined" || syncUrl) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(filters));
    } catch (error) {
      console.warn(`Unable to persist filters for ${endpoint}:`, error);
    }
  }, [endpoint, filters, storageKey, syncUrl]);

  // Reset page when filters change (debounced)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (skipPageReset.current) {
      skipPageReset.current = false;
      return;
    }
    setPage(1);
  }, [debouncedFilters]);

  // Clear selection when data changes
  useEffect(() => {
    clearSelection();
  }, [page, debouncedFilters, sortBy, sortDir, clearSelection]);

  // Fetch items
  const fetchItems = useCallback(
    ({ silent = false } = {}) => {
      if (!silent) setLoading(true);

      const params = {
        page,
        sort_by: sortBy,
        sort_dir: sortDir,
        ...Object.entries(debouncedFilters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {}),
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
    },
    [endpoint, page, sortBy, sortDir, debouncedFilters],
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Sort handler
  const handleSort = useCallback(
    (column) => {
      if (sortBy === column) {
        setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(column);
        setSortDir("asc");
      }
    },
    [sortBy],
  );

  // Filter handlers
  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    const cleared = {};
    filterKeys.forEach((key) => {
      cleared[key] = "";
    });
    setFilters(cleared);
    setPage(1);
  }, [filterKeys]);

  // Delete single item
  const deleteItem = useCallback(
    async (id, options = {}) => {
      const {
        successMessage = "Item deleted successfully",
        errorMessage = "Error deleteting item",
      } = options;

      try {
        await axiosClient.delete(`${endpoint}/${id}`);
        toast.success(successMessage);
        fetchItems();
        return true;
      } catch (error) {
        toast.error(errorMessage);
        console.error("Delete error:", error);
        return false;
      }
    },
    [endpoint, fetchItems],
  );

  // Bulk delete
  const bulkDelete = useCallback(
    async (ids, options = {}) => {
      const {
        successMessage = `${ids.length} items deleted successfully`,
        errorMessage = "Error deleteting items",
      } = options;

      try {
        await axiosClient.post(`${endpoint}/bulk-delete`, { ids });
        toast.success(successMessage);
        clearSelection();
        fetchItems();
        return true;
      } catch (error) {
        toast.error(errorMessage);
        console.error("Bulk delete error:", error);
        return false;
      }
    },
    [endpoint, fetchItems, clearSelection],
  );

  // --- URL SYNC ---

  // 1. Push state changes to URL after every render where they might have changed
  // We use useRef to track previous values and only sync when they actually change
  const prevRef = useRef({ page, sortBy, sortDir, filters: { ...filters } });

  useEffect(() => {
    if (!syncUrl) return;
    if (isSyncingFromUrl.current) {
      isSyncingFromUrl.current = false;
      prevRef.current = { page, sortBy, sortDir, filters: { ...filters } };
      return;
    }

    const prev = prevRef.current;
    const changed =
      page !== prev.page ||
      sortBy !== prev.sortBy ||
      sortDir !== prev.sortDir ||
      filterKeys.some((k) => filters[k] !== prev.filters[k]);

    if (changed) {
      replaceQueryParams(buildUrlParams(page, sortBy, sortDir, filters));
      prevRef.current = { page, sortBy, sortDir, filters: { ...filters } };
    }
  });

  // 2. Listen for browser back/forward (popstate) and sync state from URL
  useEffect(() => {
    if (!syncUrl) return;

    const handlePopState = () => {
      isSyncingFromUrl.current = true;

      const newPage = readIntParam("page", 1);
      const newSortBy = readParam("sort_by", defaultSort.column);
      const newSortDir = readParam("sort_dir", defaultSort.direction);

      const newFilters = {};
      filterKeys.forEach((key) => {
        newFilters[key] = readParam(key, "");
      });

      setPage(newPage);
      setSortBy(newSortBy);
      setSortDir(newSortDir);
      setFilters(newFilters);
      setDebouncedFilters(newFilters);
      skipPageReset.current = true;
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [syncUrl, defaultSort, filterKeys]);

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
    bulkDelete,
  };
}
