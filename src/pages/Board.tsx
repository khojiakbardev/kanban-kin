import { useState, useEffect } from 'react';
import { Issue, FilterState } from '@/types';
import { api } from '@/services/api';
import { KanbanBoard } from '@/components/Board/KanbanBoard';
import { useToast } from '@/hooks/use-toast';

export default function Board() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    assignee: null,
    severity: null,
    priority: null
  });
  const { toast } = useToast();

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const data = await api.getIssues();
      setIssues(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load issues. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading issues...</p>
        </div>
      </div>
    );
  }

  return (
    <KanbanBoard
      issues={issues}
      onIssuesChange={setIssues}
      filters={filters}
      onFiltersChange={setFilters}
    />
  );
}