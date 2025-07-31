import { useDroppable } from '@dnd-kit/core';
import { Column } from '@/types';
import { IssueCard } from './IssueCard';
import { Badge } from '@/components/ui/badge';

interface KanbanColumnProps {
  column: Column;
  isUpdating: string | null;
  canDrop: boolean;
}

export function KanbanColumn({ column, isUpdating, canDrop }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    disabled: !canDrop
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col h-full bg-gradient-card rounded-xl border-2 transition-all duration-200
        ${isOver && canDrop ? 'border-primary shadow-glow' : 'border-border'}
        ${!canDrop ? 'opacity-60' : ''}
      `}
    >
      {/* Column Header */}
      <div className="p-3 md:p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <h3 className="font-semibold text-foreground text-sm md:text-base">{column.title}</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {column.issues.length}
          </Badge>
        </div>
      </div>

      {/* Issues List */}
      <div className="flex-1 p-3 md:p-4 space-y-2 md:space-y-3 overflow-y-auto max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-280px)] min-h-0">
        {column.issues.map(issue => (
          <IssueCard
            key={issue.id}
            issue={issue}
            isUpdating={isUpdating === issue.id}
            canDrag={canDrop}
          />
        ))}
        
        {column.issues.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">No issues</p>
          </div>
        )}
      </div>
    </div>
  );
}