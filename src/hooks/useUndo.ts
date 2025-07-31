import { useState, useEffect, useCallback } from 'react';
import { UndoAction, Status } from '@/types';

const UNDO_TIMEOUT = 5000; // 5 seconds

export function useUndo() {
  const [undoActions, setUndoActions] = useState<Map<string, UndoAction>>(new Map());

  const addUndoAction = useCallback((action: UndoAction) => {
    setUndoActions(prev => {
      const newMap = new Map(prev);
      newMap.set(action.id, action);
      return newMap;
    });

    // Auto-remove after timeout
    setTimeout(() => {
      setUndoActions(prev => {
        const newMap = new Map(prev);
        newMap.delete(action.id);
        return newMap;
      });
    }, UNDO_TIMEOUT);
  }, []);

  const removeUndoAction = useCallback((actionId: string) => {
    setUndoActions(prev => {
      const newMap = new Map(prev);
      newMap.delete(actionId);
      return newMap;
    });
  }, []);

  const getUndoAction = useCallback((actionId: string) => {
    return undoActions.get(actionId);
  }, [undoActions]);

  return {
    undoActions: Array.from(undoActions.values()),
    addUndoAction,
    removeUndoAction,
    getUndoAction
  };
}