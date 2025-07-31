import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Issue, Status, Column, FilterState, UndoAction } from '@/types';
import { api } from '@/services/api';
import { currentUser } from '@/data/currentUser';
import { sortIssuesByPriority } from '@/utils/priorityScore';
import { usePolling } from '@/hooks/usePolling';
import { useUndo } from '@/hooks/useUndo';
import { useToast } from '@/hooks/use-toast';
import { KanbanColumn } from './KanbanColumn';
import { IssueCard } from './IssueCard';
import { BoardHeader } from './BoardHeader';
import { RecentlyViewedSidebar } from './RecentlyViewedSidebar';

interface KanbanBoardProps {
  issues: Issue[];
  onIssuesChange: (issues: Issue[]) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function KanbanBoard({ issues, onIssuesChange, filters, onFiltersChange }: KanbanBoardProps) {
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const { undoActions, addUndoAction, removeUndoAction } = useUndo();

  // Polling for real-time updates
  const { isPolling, lastSyncTime } = usePolling({
    queryFn: api.getIssues,
    interval: 10000, // 10 seconds
    onSuccess: (data) => {
      onIssuesChange(data);
    },
    onError: (error) => {
      console.error('Polling error:', error);
    }
  });

  // Filter and sort issues
  const filteredIssues = issues.filter(issue => {
    if (filters.search && !issue.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !issue.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))) {
      return false;
    }
    if (filters.assignee && issue.assignee !== filters.assignee) {
      return false;
    }
    if (filters.severity && issue.severity !== filters.severity) {
      return false;
    }
    if (filters.priority && issue.priority !== filters.priority) {
      return false;
    }
    return true;
  });

  const sortedIssues = sortIssuesByPriority(filteredIssues);

  // Group issues by status
  const columns: Column[] = [
    {
      id: 'backlog',
      title: 'Backlog',
      issues: sortedIssues.filter(issue => issue.status === 'backlog'),
      color: 'hsl(var(--backlog))'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      issues: sortedIssues.filter(issue => issue.status === 'in-progress'),
      color: 'hsl(var(--in-progress))'
    },
    {
      id: 'done',
      title: 'Done',
      issues: sortedIssues.filter(issue => issue.status === 'done'),
      color: 'hsl(var(--done))'
    }
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const issue = issues.find(i => i.id === event.active.id);
    setDraggedIssue(issue || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedIssue(null);

    if (!over || active.id === over.id) return;

    const issueId = active.id as string;
    const newStatus = over.id as Status;
    const issue = issues.find(i => i.id === issueId);

    if (!issue || issue.status === newStatus) return;

    // Check permissions
    if (currentUser.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only admins can move issues.",
        variant: "destructive"
      });
      return;
    }

    const oldStatus = issue.status;
    
    // Optimistic update
    const updatedIssues = issues.map(i => 
      i.id === issueId ? { ...i, status: newStatus } : i
    );
    onIssuesChange(updatedIssues);

    setIsUpdating(issueId);

    try {
      await api.updateIssueStatus(issueId, newStatus);
      
      // Create undo action
      const undoAction: UndoAction = {
        id: `undo-${Date.now()}`,
        issueId,
        fromStatus: oldStatus,
        toStatus: newStatus,
        timestamp: Date.now()
      };
      
      addUndoAction(undoAction);

      toast({
        title: "Issue moved",
        description: `Moved to ${newStatus}`,
        action: (
          <button
            onClick={() => handleUndo(undoAction)}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/80 transition-colors"
          >
            Undo
          </button>
        )
      });
    } catch (error) {
      // Revert optimistic update
      onIssuesChange(issues);
      toast({
        title: "Error",
        description: "Failed to move issue. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleUndo = async (action: UndoAction) => {
    try {
      await api.updateIssueStatus(action.issueId, action.fromStatus);
      
      const updatedIssues = issues.map(i => 
        i.id === action.issueId ? { ...i, status: action.fromStatus } : i
      );
      onIssuesChange(updatedIssues);
      
      removeUndoAction(action.id);
      toast({
        title: "Undone",
        description: "Issue moved back successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to undo action",
        variant: "destructive"
      });
    }
  };

  const canDragDrop = currentUser.role === 'admin';

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <BoardHeader 
          filters={filters}
          onFiltersChange={onFiltersChange}
          isPolling={isPolling}
          lastSyncTime={lastSyncTime}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        
        <div className="flex-1 p-6 overflow-hidden">
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-3 gap-6 h-full">
              {columns.map(column => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  isUpdating={isUpdating}
                  canDrop={canDragDrop}
                />
              ))}
            </div>
            
            <DragOverlay>
              {draggedIssue && (
                <IssueCard issue={draggedIssue} isDragging />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      <RecentlyViewedSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}