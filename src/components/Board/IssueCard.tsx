import { useDraggable } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import { Issue, Priority } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, AlertTriangle } from 'lucide-react';
import { addToRecentlyAccessed } from '@/utils/localStorage';
import { calculatePriorityScore } from '@/utils/priorityScore';

interface IssueCardProps {
  issue: Issue;
  isDragging?: boolean;
  isUpdating?: boolean;
  canDrag?: boolean;
}

const priorityColors: Record<Priority, string> = {
  low: 'hsl(var(--success))',
  medium: 'hsl(var(--warning))', 
  high: 'hsl(var(--destructive))',
  critical: 'hsl(var(--destructive))'
};

const severityLabels = {
  1: 'Minimal',
  2: 'Minor', 
  3: 'Moderate',
  4: 'Major',
  5: 'Critical'
};

export function IssueCard({ issue, isDragging = false, isUpdating = false, canDrag = true }: IssueCardProps) {
  const navigate = useNavigate();
  
  const { attributes, listeners, setNodeRef, transform, isDragging: isDraggingActive } = useDraggable({
    id: issue.id,
    disabled: !canDrag
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleClick = () => {
    addToRecentlyAccessed(issue);
    navigate(`/issue/${issue.id}`);
  };

  const priorityScore = calculatePriorityScore(issue);
  const createdDate = new Date(issue.createdAt);
  const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`
        cursor-pointer transition-all duration-200 group
        ${isDragging || isDraggingActive ? 'shadow-glow rotate-2 scale-105' : 'shadow-card hover:shadow-card-hover'}
        ${isUpdating ? 'opacity-50 pointer-events-none' : ''}
        ${!canDrag ? 'cursor-default' : ''}
      `}
      onClick={handleClick}
      {...listeners}
      {...attributes}
    >
      <CardContent className="p-4">
        {/* Priority Badge */}
        <div className="flex items-start justify-between mb-3">
          <Badge 
            variant="outline" 
            className="text-xs font-medium"
            style={{ 
              borderColor: priorityColors[issue.priority],
              color: priorityColors[issue.priority]
            }}
          >
            {issue.priority.toUpperCase()}
          </Badge>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <AlertTriangle className="w-3 h-3" />
            <span>{severityLabels[issue.severity]}</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="font-medium text-sm text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {issue.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {issue.description}
        </p>

        {/* Tags */}
        {issue.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {issue.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
            {issue.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                +{issue.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          {/* Assignee */}
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs bg-muted">
                {issue.assignee.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-20">
              {issue.assignee}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{daysSinceCreated}d</span>
            </div>
            <div className="flex items-center gap-1 font-medium">
              <span>#{priorityScore}</span>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {isUpdating && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}