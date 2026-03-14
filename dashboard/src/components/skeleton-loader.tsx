'use client';

export function SkeletonLoader() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Score + Summary skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {/* Score ring skeleton */}
        <div className="flex items-center justify-center rounded-xl border border-border bg-bg-card p-6 md:col-span-1">
          <div className="h-32 w-32 animate-pulse-subtle rounded-full border-4 border-border bg-bg-secondary" />
        </div>
        {/* Severity cards skeleton */}
        <div className="grid grid-cols-2 gap-3 md:col-span-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`rounded-xl border border-border bg-bg-card p-4 stagger-${i + 1} animate-pulse-subtle`}
            >
              <div className="mb-3 h-3 w-16 rounded bg-bg-secondary" />
              <div className="mb-2 h-8 w-12 rounded bg-bg-secondary" />
              <div className="h-2 w-20 rounded bg-bg-secondary" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-28 animate-pulse-subtle rounded-lg bg-bg-card" />
        ))}
      </div>

      {/* Issue cards skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`rounded-xl border border-border bg-bg-card p-5 stagger-${i + 1} animate-pulse-subtle`}
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="h-5 w-2 rounded bg-bg-secondary" />
                <div className="h-4 w-48 rounded bg-bg-secondary" />
              </div>
              <div className="mb-2 h-3 w-full rounded bg-bg-secondary" />
              <div className="h-3 w-3/4 rounded bg-bg-secondary" />
              <div className="mt-4 flex gap-2">
                <div className="h-5 w-16 rounded-full bg-bg-secondary" />
                <div className="h-5 w-20 rounded-full bg-bg-secondary" />
              </div>
            </div>
          ))}
        </div>
        {/* Fix panel skeleton */}
        <div className="hidden lg:col-span-2 lg:block">
          <div className="rounded-xl border border-border bg-bg-card p-5 animate-pulse-subtle">
            <div className="mb-4 h-5 w-32 rounded bg-bg-secondary" />
            <div className="mb-3 h-3 w-20 rounded bg-bg-secondary" />
            <div className="mb-6 h-32 rounded-lg bg-bg-secondary" />
            <div className="mb-3 h-3 w-20 rounded bg-bg-secondary" />
            <div className="h-32 rounded-lg bg-bg-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}
