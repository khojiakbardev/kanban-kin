import { Issue, Status } from '@/types';
import issuesData from '@/data/issues.json';

// Simulate API delay and potential errors
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const shouldSimulateError = () => Math.random() < 0.1; // 10% chance of error

let issues: Issue[] = [...(issuesData as Issue[])];

export class APIError extends Error {
  constructor(message: string, public status: number = 500) {
    super(message);
    this.name = 'APIError';
  }
}

export const api = {
  // Get all issues
  async getIssues(): Promise<Issue[]> {
    await delay(300);
    
    if (shouldSimulateError()) {
      throw new APIError('Failed to fetch issues', 500);
    }
    
    return [...issues];
  },

  // Get issue by ID
  async getIssue(id: string): Promise<Issue | null> {
    await delay(200);
    
    if (shouldSimulateError()) {
      throw new APIError('Failed to fetch issue', 500);
    }
    
    const issue = issues.find(issue => issue.id === id);
    return issue || null;
  },

  // Update issue status
  async updateIssueStatus(id: string, status: Status): Promise<Issue> {
    await delay(500); // Simulate network delay
    
    if (shouldSimulateError()) {
      throw new APIError('Failed to update issue status', 500);
    }
    
    const issueIndex = issues.findIndex(issue => issue.id === id);
    if (issueIndex === -1) {
      throw new APIError('Issue not found', 404);
    }
    
    issues[issueIndex] = {
      ...issues[issueIndex],
      status,
      updatedAt: new Date().toISOString()
    };
    
    return issues[issueIndex];
  },

  // Update issue
  async updateIssue(id: string, updates: Partial<Issue>): Promise<Issue> {
    await delay(400);
    
    if (shouldSimulateError()) {
      throw new APIError('Failed to update issue', 500);
    }
    
    const issueIndex = issues.findIndex(issue => issue.id === id);
    if (issueIndex === -1) {
      throw new APIError('Issue not found', 404);
    }
    
    issues[issueIndex] = {
      ...issues[issueIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return issues[issueIndex];
  },

  // Create new issue
  async createIssue(issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Issue> {
    await delay(600);
    
    if (shouldSimulateError()) {
      throw new APIError('Failed to create issue', 500);
    }
    
    const newIssue: Issue = {
      ...issueData,
      id: `issue-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    issues.push(newIssue);
    return newIssue;
  },

  // Delete issue
  async deleteIssue(id: string): Promise<void> {
    await delay(300);
    
    if (shouldSimulateError()) {
      throw new APIError('Failed to delete issue', 500);
    }
    
    const issueIndex = issues.findIndex(issue => issue.id === id);
    if (issueIndex === -1) {
      throw new APIError('Issue not found', 404);
    }
    
    issues.splice(issueIndex, 1);
  },

  // Simulate real-time updates
  async getLastSyncTime(): Promise<string> {
    await delay(100);
    return new Date().toISOString();
  }
};