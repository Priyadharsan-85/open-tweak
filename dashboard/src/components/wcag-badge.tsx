'use client';

import type { Severity } from '@/lib/types';

interface WcagBadgeProps {
  criterion: string;
  title?: string;
  severity?: Severity;
  principle?: string;
}

const severityColors: Record<Severity, string> = {
  critical: 'bg-severity-critical/15 text-severity-critical border-severity-critical/30',
  serious: 'bg-severity-serious/15 text-severity-serious border-severity-serious/30',
  moderate: 'bg-severity-moderate/15 text-severity-moderate border-severity-moderate/30',
  minor: 'bg-severity-minor/15 text-severity-minor border-severity-minor/30',
};

const principleColors: Record<string, string> = {
  Perceivable: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Operable: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Understandable: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  Robust: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

export function WcagBadge({ criterion, title, severity, principle }: WcagBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* WCAG Criterion badge */}
      <span className="inline-flex items-center rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
        WCAG {criterion}
      </span>

      {/* Title */}
      {title && (
        <span className="text-xs text-text-secondary">{title}</span>
      )}

      {/* Severity badge */}
      {severity && (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${severityColors[severity]}`}>
          {severity}
        </span>
      )}

      {/* Principle badge */}
      {principle && (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${principleColors[principle] || 'bg-gray-500/15 text-gray-400 border-gray-500/30'}`}>
          {principle}
        </span>
      )}
    </div>
  );
}
