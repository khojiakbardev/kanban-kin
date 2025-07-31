import { useNavigate } from 'react-router-dom';
import { X, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { getRecentlyAccessed, clearRecentlyAccessed } from '@/utils/localStorage';
import { useEffect, useState } from 'react';
import { RecentlyAccessed } from '@/types';

interface RecentlyViewedSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecentlyViewedSidebar({ isOpen, onClose }: RecentlyViewedSidebarProps) {
  const navigate = useNavigate();
  const [recentIssues, setRecentIssues] = useState<RecentlyAccessed[]>([]);

  useEffect(() => {
    if (isOpen) {
      setRecentIssues(getRecentlyAccessed());
    }
  }, [isOpen]);

  const handleIssueClick = (issueId: string) => {
    navigate(`/issue/${issueId}`);
    onClose();
  };

  const handleClearAll = () => {
    clearRecentlyAccessed();
    setRecentIssues([]);
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recently Viewed
            </SheetTitle>
            {recentIssues.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll}>
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6">
          {recentIssues.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recently viewed issues</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentIssues.map(({ issueId, accessedAt, issue }) => (
                <div
                  key={issueId}
                  onClick={() => handleIssueClick(issueId)}
                  className="p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all duration-200 group bg-gradient-card hover:shadow-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {issue.title}
                    </h4>
                    <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {issue.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                      >
                        {issue.priority}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {issue.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(accessedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}