import { Search, Filter, Clock, Users, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FilterState, Priority, Severity } from '@/types';
import { currentUser } from '@/data/currentUser';
import { ThemeToggle } from '@/components/ThemeToggle';

interface BoardHeaderProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isPolling: boolean;
  lastSyncTime: Date | null;
  onOpenSidebar: () => void;
}

const assignees = [
  'Alice Johnson',
  'Bob Smith', 
  'Carol Davis',
  'David Wilson',
  'Eva Brown',
  'Frank Miller'
];

export function BoardHeader({ 
  filters, 
  onFiltersChange, 
  isPolling, 
  lastSyncTime,
  onOpenSidebar 
}: BoardHeaderProps) {
  const hasActiveFilters = filters.search || filters.assignee || filters.severity || filters.priority;

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      assignee: null,
      severity: null,
      priority: null
    });
  };

  return (
    <div className="border-b border-border bg-gradient-secondary">
      <div className="px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <h1 className="text-lg md:text-xl font-bold text-foreground">Issue Board</h1>
            </div>
            
            <Badge variant="outline" className="text-xs w-fit">
              {currentUser.role}
            </Badge>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Sync Status */}
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <Clock className={`w-4 h-4 ${isPolling ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isPolling ? 'Syncing...' : lastSyncTime ? `Last sync: ${lastSyncTime.toLocaleTimeString()}` : 'Not synced'}
              </span>
              <span className="sm:hidden">
                {isPolling ? 'Syncing...' : 'Synced'}
              </span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Recently Viewed Button */}
            <Button variant="outline" size="sm" onClick={onOpenSidebar}>
              <Users className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Recent</span>
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="space-y-3 md:space-y-0 md:flex md:items-center md:gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search issues by title or tags..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 md:flex md:items-center">
            {/* Assignee Filter */}
            <Select 
              value={filters.assignee || 'all'} 
              onValueChange={(value) => onFiltersChange({ ...filters, assignee: value === 'all' ? null : value })}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                {assignees.map(assignee => (
                  <SelectItem key={assignee} value={assignee}>
                    {assignee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Severity Filter */}
            <Select 
              value={filters.severity?.toString() || 'all'} 
              onValueChange={(value) => onFiltersChange({ ...filters, severity: value === 'all' ? null : Number(value) as Severity })}
            >
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="1">1 - Minimal</SelectItem>
                <SelectItem value="2">2 - Minor</SelectItem>
                <SelectItem value="3">3 - Moderate</SelectItem>
                <SelectItem value="4">4 - Major</SelectItem>
                <SelectItem value="5">5 - Critical</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select 
              value={filters.priority || 'all'} 
              onValueChange={(value) => onFiltersChange({ ...filters, priority: value === 'all' ? null : value as Priority })}
            >
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="col-span-2 md:col-span-1 md:w-auto">
                <Filter className="w-4 h-4 md:mr-2" />
                <span className="md:inline">Clear</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}