'use client';

import type { Severity } from '@/lib/types';

type SeverityFilter = Severity | 'All';

interface SeverityFilterProps {
  active: SeverityFilter;
  onChange: (severity: SeverityFilter) => void;
  counts: Record<SeverityFilter, number>;
}

const severities: { key: SeverityFilter; label: string; dot: string }[] = [
  { key: 'All', label: 'All', dot: 'bg-text-muted' },
  { key: 'critical', label: 'Critical', dot: 'bg-severity-critical' },
  { key: 'serious', label: 'Serious', dot: 'bg-severity-serious' },
  { key: 'moderate', label: 'Moderate', dot: 'bg-severity-moderate' },
  { key: 'minor', label: 'Minor', dot: 'bg-severity-minor' },
];

export function SeverityFilter({ active, onChange, counts }: SeverityFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {severities.map((s) => {
        const isActive = active === s.key;
        return (
          <button
            key={s.key}
            onClick={() => onChange(s.key)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? 'border-accent/30 bg-accent/10 text-accent'
                : 'border-border bg-bg-card text-text-muted hover:bg-bg-card-hover hover:text-text-secondary'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${s.dot}`} />
            {s.label}
            <span className={`ml-0.5 ${isActive ? 'text-accent/70' : 'text-text-muted/60'}`}>
              {counts[s.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
