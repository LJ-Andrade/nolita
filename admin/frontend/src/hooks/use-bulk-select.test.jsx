import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useBulkSelect } from './use-bulk-select';

const items = [
  { id: 1, name: 'First' },
  { id: 2, name: 'Second' },
];

describe('useBulkSelect', () => {
  it('selects and unselects a single item', () => {
    const { result } = renderHook(() => useBulkSelect(items));

    act(() => result.current.toggleSelect(1));
    expect(result.current.selectedIds).toEqual([1]);
    expect(result.current.selectedCount).toBe(1);
    expect(result.current.isSelected(1)).toBe(true);

    act(() => result.current.toggleSelect(1));
    expect(result.current.selectedIds).toEqual([]);
  });

  it('selects all visible items and clears them', () => {
    const { result } = renderHook(() => useBulkSelect(items));

    act(() => result.current.toggleSelectAll());
    expect(result.current.selectedIds).toEqual([1, 2]);
    expect(result.current.isAllSelected).toBe(true);

    act(() => result.current.clearSelection());
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.isEmpty).toBe(true);
  });
});
