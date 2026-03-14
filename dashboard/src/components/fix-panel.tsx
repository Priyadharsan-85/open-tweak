'use client';

import { Highlight, themes } from 'prism-react-renderer';
import type { Issue } from '@/lib/types';

interface FixPanelProps {
  issue: Issue | null;
}

function CodeBlock({
  code,
  language,
  variant,
}: {
  code: string;
  language: string;
  variant: 'before' | 'after';
}) {
  const bgColor = variant === 'before' ? 'bg-red-950/20' : 'bg-green-950/20';
  const borderColor =
    variant === 'before' ? 'border-severity-critical/20' : 'border-success/20';
  const labelColor = variant === 'before' ? 'text-severity-critical' : 'text-success';
  const label = variant === 'before' ? 'Before' : 'After';

  return (
    <div className={`overflow-hidden rounded-lg border ${borderColor}`}>
      <div className={`flex items-center justify-between border-b ${borderColor} ${bgColor} px-3 py-2`}>
        <span className={`text-xs font-medium ${labelColor}`}>{label}</span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-text-muted transition-colors hover:bg-bg-secondary hover:text-text-secondary"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25z" />
            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25z" />
          </svg>
          Copy
        </button>
      </div>
      <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`overflow-x-auto p-3 ${bgColor}`}
            style={{ ...style, background: 'transparent', margin: 0 }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

export function FixPanel({ issue }: FixPanelProps) {
  if (!issue) {
    return (
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mb-3 h-8 w-8 text-text-muted"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          <p className="text-sm text-text-muted">
            Select an issue to see the code fix
          </p>
        </div>
      </div>
    );
  }

  const firstInstance = issue.instances[0];
  if (!firstInstance) return null;

  return (
    <div className="animate-slide-in-right rounded-xl border border-border bg-bg-card">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h3 className="mb-1 text-sm font-semibold text-text-primary">
          Fix: {issue.message.slice(0, 60)}
          {issue.message.length > 60 ? '...' : ''}
        </h3>
        <p className="text-xs text-text-muted">{issue.howToFix}</p>
      </div>

      {/* Code blocks */}
      <div className="space-y-3 p-4">
        <CodeBlock
          code={firstInstance.fixCode.before}
          language={firstInstance.fixCode.language}
          variant="before"
        />
        <CodeBlock
          code={firstInstance.fixCode.after}
          language={firstInstance.fixCode.language}
          variant="after"
        />
      </div>

      {/* WCAG link */}
      <div className="border-t border-border px-4 py-3">
        <a
          href={issue.wcagUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-accent transition-colors hover:text-accent-hover"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
            <path d="M3.75 2h3.5a.75.75 0 010 1.5h-3.5a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-3.5a.75.75 0 011.5 0v3.5A1.75 1.75 0 0112.25 14h-8.5A1.75 1.75 0 012 12.25v-8.5C2 2.784 2.784 2 3.75 2zm6.854-1h4.146a.25.25 0 01.25.25v4.146a.25.25 0 01-.427.177L13.03 4.03 9.28 7.78a.751.751 0 01-1.042-.018.751.751 0 01-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0110.604 1z" />
          </svg>
          Read WCAG {issue.wcagCriterion} Understanding Doc
        </a>
      </div>
    </div>
  );
}
