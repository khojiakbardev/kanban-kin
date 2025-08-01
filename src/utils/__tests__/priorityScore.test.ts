import { describe, it, expect } from 'vitest';
import { calculatePriorityScore, sortIssuesByPriority } from '../priorityScore';
import { Issue } from '@/types';

const mockIssue = (overrides: Partial<Issue> = {}): Issue => ({
  id: '1',
  title: 'Test Issue',
  description: 'Test Description',
  status: 'backlog',
  priority: 'medium',
  severity: 3,
  assignee: 'Test User',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: [],
  userDefinedRank: 0,
  ...overrides
});

describe('calculatePriorityScore', () => {
  it('should calculate priority score correctly', () => {
    const issue = mockIssue({
      severity: 3,
      userDefinedRank: 5,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    });

    const score = calculatePriorityScore(issue);
    // severity * 10 + (daysSinceCreated * -1) + userDefinedRank
    // 3 * 10 + (-2) + 5 = 33
    expect(score).toBe(33);
  });

  it('should handle zero user defined rank', () => {
    const issue = mockIssue({
      severity: 2,
      userDefinedRank: 0,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    });

    const score = calculatePriorityScore(issue);
    // 2 * 10 + (-1) + 0 = 19
    expect(score).toBe(19);
  });
});

describe('sortIssuesByPriority', () => {
  it('should sort issues by priority score in descending order', () => {
    const issues: Issue[] = [
      mockIssue({
        id: '1',
        severity: 1,
        userDefinedRank: 0,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }),
      mockIssue({
        id: '2',
        severity: 5,
        userDefinedRank: 10,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }),
      mockIssue({
        id: '3',
        severity: 3,
        userDefinedRank: 5,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      })
    ];

    const sorted = sortIssuesByPriority(issues);
    
    // Highest score should be first
    expect(sorted[0].id).toBe('2'); // severity 5, rank 10, -1 day = 59
    expect(sorted[1].id).toBe('3'); // severity 3, rank 5, -2 days = 33  
    expect(sorted[2].id).toBe('1'); // severity 1, rank 0, -1 day = 9
  });

  it('should sort by creation date when scores are equal', () => {
    const olderDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const newerDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

    const issues: Issue[] = [
      mockIssue({
        id: 'older',
        severity: 3,
        userDefinedRank: 3, 
        createdAt: olderDate
      }),
      mockIssue({
        id: 'newer',
        severity: 3,
        userDefinedRank: 2,
        createdAt: newerDate
      })
    ];

    const sorted = sortIssuesByPriority(issues);
    
    // When scores are equal (both have score 32), newer should come first
    expect(sorted[0].id).toBe('newer');
    expect(sorted[1].id).toBe('older');
  });

  it('should not mutate original array', () => {
    const issues: Issue[] = [
      mockIssue({ id: '1', severity: 1 }),
      mockIssue({ id: '2', severity: 3 })
    ];
    
    const originalOrder = issues.map(i => i.id);
    sortIssuesByPriority(issues);
    
    expect(issues.map(i => i.id)).toEqual(originalOrder);
  });
});