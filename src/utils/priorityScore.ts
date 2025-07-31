import { Issue } from '@/types';

export function calculatePriorityScore(issue: Issue): number {
  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return issue.severity * 10 + (daysSinceCreated * -1) + issue.userDefinedRank;
}

export function sortIssuesByPriority(issues: Issue[]): Issue[] {
  return [...issues].sort((a, b) => {
    const scoreA = calculatePriorityScore(a);
    const scoreB = calculatePriorityScore(b);
    
    if (scoreA === scoreB) {
      // If scores are equal, newer issues come first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    
    return scoreB - scoreA; // Higher score comes first
  });
}