import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePagination } from '../usePagination';

const generateTestData = (count: number) => 
  Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

describe('usePagination', () => {
  it('should paginate data correctly', () => {
    const data = generateTestData(10);
    const { result } = renderHook(() => usePagination({ data, itemsPerPage: 3 }));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(4);
    expect(result.current.paginatedData).toEqual([
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ]);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPreviousPage).toBe(false);
  });

  it('should navigate to next page', () => {
    const data = generateTestData(10);
    const { result } = renderHook(() => usePagination({ data, itemsPerPage: 3 }));

    act(() => {
      result.current.goToNextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedData).toEqual([
      { id: 4, name: 'Item 4' },
      { id: 5, name: 'Item 5' },
      { id: 6, name: 'Item 6' }
    ]);
  });

  it('should navigate to previous page', () => {
    const data = generateTestData(10);
    const { result } = renderHook(() => usePagination({ data, itemsPerPage: 3 }));

    act(() => {
      result.current.goToNextPage();
      result.current.goToPreviousPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should go to specific page', () => {
    const data = generateTestData(10);
    const { result } = renderHook(() => usePagination({ data, itemsPerPage: 3 }));

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.paginatedData).toEqual([
      { id: 7, name: 'Item 7' },
      { id: 8, name: 'Item 8' },
      { id: 9, name: 'Item 9' }
    ]);
  });

  it('should not exceed page boundaries', () => {
    const data = generateTestData(5);
    const { result } = renderHook(() => usePagination({ data, itemsPerPage: 3 }));

    // Try to go beyond last page
    act(() => {
      result.current.goToPage(10);
    });

    expect(result.current.currentPage).toBe(2); // Last valid page

    // Try to go before first page
    act(() => {
      result.current.goToPage(-1);
    });

    expect(result.current.currentPage).toBe(1); // First page
  });

  it('should reset page to 1', () => {
    const data = generateTestData(10);
    const { result } = renderHook(() => usePagination({ data, itemsPerPage: 3 }));

    act(() => {
      result.current.goToPage(3);
      result.current.resetPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should handle empty data', () => {
    const { result } = renderHook(() => usePagination({ data: [], itemsPerPage: 3 }));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.paginatedData).toEqual([]);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPreviousPage).toBe(false);
  });
});