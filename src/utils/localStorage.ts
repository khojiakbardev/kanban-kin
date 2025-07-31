import { RecentlyAccessed, Issue } from '@/types';

const RECENTLY_ACCESSED_KEY = 'kanban-recently-accessed';
const MAX_RECENT_ITEMS = 5;

export function getRecentlyAccessed(): RecentlyAccessed[] {
  try {
    const stored = localStorage.getItem(RECENTLY_ACCESSED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToRecentlyAccessed(issue: Issue): void {
  try {
    const recent = getRecentlyAccessed();
    const existing = recent.findIndex(item => item.issueId === issue.id);
    
    const newItem: RecentlyAccessed = {
      issueId: issue.id,
      accessedAt: Date.now(),
      issue
    };
    
    if (existing >= 0) {
      // Update existing item
      recent[existing] = newItem;
    } else {
      // Add new item at the beginning
      recent.unshift(newItem);
    }
    
    // Keep only the most recent items
    const trimmed = recent
      .sort((a, b) => b.accessedAt - a.accessedAt)
      .slice(0, MAX_RECENT_ITEMS);
    
    localStorage.setItem(RECENTLY_ACCESSED_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save to recently accessed:', error);
  }
}

export function clearRecentlyAccessed(): void {
  try {
    localStorage.removeItem(RECENTLY_ACCESSED_KEY);
  } catch (error) {
    console.error('Failed to clear recently accessed:', error);
  }
}
