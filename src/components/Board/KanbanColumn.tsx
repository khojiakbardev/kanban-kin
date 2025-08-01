import { useDroppable } from '@dnd-kit/core';
import { Column } from '@/types';
import { IssueCard } from './IssueCard';
import { Badge } from '@/components/ui/badge';
import { usePagination } from '@/hooks/usePagination';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

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

  const { 
    paginatedData, 
    currentPage, 
    totalPages, 
    goToNextPage, 
    goToPreviousPage, 
    hasNextPage, 
    hasPreviousPage 
  } = usePagination({ 
    data: column.issues, 
    itemsPerPage: 5 
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
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-3 md:p-4 space-y-2 md:space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] md:max-h-[calc(100vh-360px)] min-h-0">
          {paginatedData.map(issue => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-2 border-t border-border">
            <Pagination>
              <PaginationContent className="flex justify-center gap-1">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={goToPreviousPage}
                    className={`h-8 px-2 text-xs ${!hasPreviousPage ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                  />
                </PaginationItem>
                
                <PaginationItem>
                  <PaginationLink className="h-8 px-2 text-xs bg-primary text-primary-foreground">
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={goToNextPage}
                    className={`h-8 px-2 text-xs ${!hasNextPage ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}