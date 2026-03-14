'use client';

import type { Issue, Principle, Severity } from '@/lib/types';
import { IssueCard } from './issue-card';

interface IssueListProps {
  issues: Issue[];
  selectedIssue: Issue | null;
  onSelectIssue: (issue: Issue) => void;
  activePrinciple: Principle | 'All';
  activeSeverity: Severity | 'All';
}

export function IssueList({
  issues,
  selectedIssue,
  onSelectIssue,
  activePrinciple,
  activeSeverity,
}: IssueListProps) {
  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    if (activePrinciple !== 'All' && issue.principle !== activePrinciple) return false;
    if (activeSeverity !== 'All' && issue.severity !== activeSeverity) return false;
    return true;
  });

  if (filteredIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-bg-card py-12">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mb-3 h-8 w-8 text-success"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-text-secondary">
          {issues.length === 0
            ? 'No issues found — great job!'
            : 'No issues match the current filters.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Showing {filteredIssues.length} of {issues.length} issue{issues.length !== 1 ? 's' : ''}
        </p>
      </div>
      {filteredIssues.map((issue) => (
        <div key={issue.id} className="animate-slide-up">
          <IssueCard
            issue={issue}
            isSelected={selectedIssue?.id === issue.id}
            onSelect={onSelectIssue}
          />
        </div>
      ))}
    </div>
  );
}
