'use client';

interface EmptyStateProps {
  type: 'idle' | 'error';
  message?: string;
  details?: string;
}

export function EmptyState({ type, message, details }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      {type === 'idle' ? (
        <>
          {/* Accessibility icon */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-bg-card">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-accent"
            >
              <circle cx="12" cy="4.5" r="2.5" />
              <path d="M12 7v5" />
              <path d="M8 10l4 2 4-2" />
              <path d="M9 17l3-5 3 5" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">
            Ready to Audit
          </h2>
          <p className="max-w-md text-center text-text-secondary">
            Enter any public URL above to run a comprehensive WCAG 2.1 AA accessibility audit.
            You&apos;ll get detailed issue reports with code fix suggestions.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {['Images & Alt Text', 'Color Contrast', 'Form Labels', 'Landmarks', 'Focus Management'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-bg-card px-3 py-1 text-xs text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Error icon */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-severity-critical/30 bg-severity-critical/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-severity-critical"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-text-primary">
            {message || 'Something went wrong'}
          </h2>
          <p className="max-w-md text-center text-text-secondary">
            {details || 'Please check the URL and try again.'}
          </p>
        </>
      )}
    </div>
  );
}
