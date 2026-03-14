'use client';

import type { AuditSummary as AuditSummaryType } from '@/lib/types';

interface AuditSummaryProps {
  score: number;
  summary: AuditSummaryType;
  pageTitle: string;
  url: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#22c55e';
  if (score >= 75) return '#eab308';
  if (score >= 50) return '#f97316';
  return '#ef4444';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Poor';
}

const severityCardData = [
  { key: 'critical' as const, label: 'Critical', color: 'text-severity-critical', bg: 'bg-severity-critical/10', border: 'border-severity-critical/20', icon: '🔴' },
  { key: 'serious' as const, label: 'Serious', color: 'text-severity-serious', bg: 'bg-severity-serious/10', border: 'border-severity-serious/20', icon: '🟠' },
  { key: 'moderate' as const, label: 'Moderate', color: 'text-severity-moderate', bg: 'bg-severity-moderate/10', border: 'border-severity-moderate/20', icon: '🟡' },
  { key: 'minor' as const, label: 'Minor', color: 'text-severity-minor', bg: 'bg-severity-minor/10', border: 'border-severity-minor/20', icon: '🟢' },
];

export function AuditSummary({ score, summary, pageTitle, url }: AuditSummaryProps) {
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="animate-fade-in space-y-4">
      {/* Page info */}
      <div className="rounded-xl border border-border bg-bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 text-accent">
              <path d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zm.5 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 00.37.65l2.5 1.5a.75.75 0 10.76-1.3L8.5 7.85v-3.1z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-text-primary">{pageTitle}</h2>
            <p className="text-xs text-text-muted truncate max-w-md">{url}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>{summary.total} issues</span>
            <span>·</span>
            <span>{summary.passed} rules passed</span>
          </div>
        </div>
      </div>

      {/* Score + severity cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {/* Score ring */}
        <div className="flex items-center justify-center rounded-xl border border-border bg-bg-card p-6 md:col-span-1">
          <div className="relative">
            <svg width="120" height="120" className="rotate-[-90deg]">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="#2a2a2e"
                strokeWidth="8"
              />
              {/* Score circle */}
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out"
                style={
                  {
                    '--score-offset': `${offset}`,
                    animation: 'scoreFill 1.5s ease-out forwards',
                  } as React.CSSProperties
                }
              />
            </svg>
            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: scoreColor }}>
                {score}
              </span>
              <span className="text-[10px] font-medium text-text-muted">{scoreLabel}</span>
            </div>
          </div>
        </div>

        {/* Severity summary cards */}
        <div className="grid grid-cols-2 gap-3 md:col-span-4 lg:grid-cols-4">
          {severityCardData.map((card, i) => (
            <div
              key={card.key}
              className={`rounded-xl border ${card.border} ${card.bg} p-4 animate-slide-up stagger-${i + 1} transition-colors hover:bg-opacity-20`}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm">{card.icon}</span>
                <span className={`text-xs font-medium ${card.color}`}>{card.label}</span>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>
                {summary[card.key]}
              </p>
              <p className="mt-1 text-[10px] text-text-muted">
                {summary[card.key] === 1 ? 'issue type' : 'issue types'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
