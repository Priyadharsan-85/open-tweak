'use client';

import { useState } from 'react';
import type { Issue } from '@/lib/types';
import { WcagBadge } from './wcag-badge';

interface IssueCardProps {
  issue: Issue;
  isSelected: boolean;
  onSelect: (issue: Issue) => void;
}

const severityBarColors: Record<string, string> = {
  critical: 'bg-severity-critical',
  serious: 'bg-severity-serious',
  moderate: 'bg-severity-moderate',
  minor: 'bg-severity-minor',
};

export function IssueCard({ issue, isSelected, onSelect }: IssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
        isSelected
          ? 'border-accent/50 bg-accent/5 shadow-lg shadow-accent/5'
          : 'border-border bg-bg-card hover:border-border hover:bg-bg-card-hover'
      }`}
    >
      {/* Severity color bar */}
      <div className={`absolute left-0 top-0 h-full w-1 ${severityBarColors[issue.severity]}`} />

      <div className="p-4 pl-5">
        {/* Header row */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary">
                {issue.message}
              </h3>
              {issue.count > 1 && (
                <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                  ×{issue.count}
                </span>
              )}
            </div>
            <WcagBadge
              criterion={issue.wcagCriterion}
              title={issue.wcagTitle}
              severity={issue.severity}
              principle={issue.principle}
            />
          </div>
        </div>

        {/* How to fix */}
        <p className="mt-2 text-xs text-text-muted">{issue.howToFix}</p>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => onSelect(issue)}
            className="inline-flex items-center gap-1 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
          >
            View Fix
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
              <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 011.06 0l3.25 3.25a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 010-1.06z" />
            </svg>
          </button>

          {issue.instances.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-bg-secondary hover:text-text-secondary"
            >
              {isExpanded ? 'Hide' : 'Show'} instances
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              >
                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" />
              </svg>
            </button>
          )}

          <a
            href={issue.wcagUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-accent"
          >
            WCAG docs
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
              <path d="M3.75 2h3.5a.75.75 0 010 1.5h-3.5a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-3.5a.75.75 0 011.5 0v3.5A1.75 1.75 0 0112.25 14h-8.5A1.75 1.75 0 012 12.25v-8.5C2 2.784 2.784 2 3.75 2zm6.854-1h4.146a.25.25 0 01.25.25v4.146a.25.25 0 01-.427.177L13.03 4.03 9.28 7.78a.751.751 0 01-1.042-.018.751.751 0 01-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0110.604 1z" />
            </svg>
          </a>
        </div>

        {/* Expanded instances */}
        {isExpanded && issue.instances.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            {issue.instances.map((instance, idx) => (
              <div key={idx} className="rounded-lg bg-bg-secondary p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                    Selector
                  </span>
                  <code className="text-xs text-accent">{instance.selector}</code>
                </div>
                <pre className="overflow-x-auto text-xs text-text-secondary">
                  <code>{instance.element}</code>
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
