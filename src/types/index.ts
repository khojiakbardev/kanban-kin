export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'backlog' | 'in-progress' | 'done';
export type Role = 'admin' | 'contributor';
export type Severity = 1 | 2 | 3 | 4 | 5;

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  severity: Severity;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  userDefinedRank: number;
}

export interface Column {
  id: Status;
  title: string;
  issues: Issue[];
  color: string;
}

export interface BoardState {
  columns: Column[];
  issues: Issue[];
}

export interface FilterState {
  search: string;
  assignee: string | null;
  severity: Severity | null;
  priority: Priority | null;
}

export interface SortOption {
  label: string;
  value: 'priority-score' | 'created-date' | 'updated-date' | 'title';
}

export interface UndoAction {
  id: string;
  issueId: string;
  fromStatus: Status;
  toStatus: Status;
  timestamp: number;
}

export interface RecentlyAccessed {
  issueId: string;
  accessedAt: number;
  issue: Issue;
}