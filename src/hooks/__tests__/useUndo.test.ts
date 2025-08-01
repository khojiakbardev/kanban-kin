import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUndo } from '../useUndo';
import { UndoAction } from '@/types';

describe('useUndo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should add undo actions', () => {
    const { result } = renderHook(() => useUndo());

    const undoAction: UndoAction = {
      id: 'test-1',
      issueId: 'issue-1',
      fromStatus: 'backlog',
      toStatus: 'in-progress',
      timestamp: Date.now()
    };

    act(() => {
      result.current.addUndoAction(undoAction);
    });

    expect(result.current.undoActions).toHaveLength(1);
    expect(result.current.undoActions[0]).toEqual(undoAction);
  });

  it('should remove undo actions', () => {
    const { result } = renderHook(() => useUndo());

    const undoAction: UndoAction = {
      id: 'test-1',
      issueId: 'issue-1',
      fromStatus: 'backlog',
      toStatus: 'in-progress',
      timestamp: Date.now()
    };

    act(() => {
      result.current.addUndoAction(undoAction);
    });

    expect(result.current.undoActions).toHaveLength(1);

    act(() => {
      result.current.removeUndoAction('test-1');
    });

    expect(result.current.undoActions).toHaveLength(0);
  });

  it('should get specific undo action', () => {
    const { result } = renderHook(() => useUndo());

    const undoAction: UndoAction = {
      id: 'test-1',
      issueId: 'issue-1',
      fromStatus: 'backlog',
      toStatus: 'in-progress',
      timestamp: Date.now()
    };

    act(() => {
      result.current.addUndoAction(undoAction);
    });

    const retrieved = result.current.getUndoAction('test-1');
    expect(retrieved).toEqual(undoAction);
  });

  it('should auto-remove actions after timeout', () => {
    const { result } = renderHook(() => useUndo());

    const undoAction: UndoAction = {
      id: 'test-1',
      issueId: 'issue-1',
      fromStatus: 'backlog',
      toStatus: 'in-progress',
      timestamp: Date.now()
    };

    act(() => {
      result.current.addUndoAction(undoAction);
    });

    expect(result.current.undoActions).toHaveLength(1);

    // Fast-forward time by 5 seconds (timeout duration)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.undoActions).toHaveLength(0);
  });

  it('should handle multiple undo actions', () => {
    const { result } = renderHook(() => useUndo());

    const undoAction1: UndoAction = {
      id: 'test-1',
      issueId: 'issue-1',
      fromStatus: 'backlog',
      toStatus: 'in-progress',
      timestamp: Date.now()
    };

    const undoAction2: UndoAction = {
      id: 'test-2',
      issueId: 'issue-2',
      fromStatus: 'in-progress',
      toStatus: 'done',
      timestamp: Date.now()
    };

    act(() => {
      result.current.addUndoAction(undoAction1);
      result.current.addUndoAction(undoAction2);
    });

    expect(result.current.undoActions).toHaveLength(2);
    expect(result.current.getUndoAction('test-1')).toEqual(undoAction1);
    expect(result.current.getUndoAction('test-2')).toEqual(undoAction2);
  });
});