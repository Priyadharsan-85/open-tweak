'use client';

import type { Principle } from '@/lib/types';

type PrincipleFilter = Principle | 'All';

interface PourTabsProps {
  active: PrincipleFilter;
  onChange: (principle: PrincipleFilter) => void;
  counts: Record<PrincipleFilter, number>;
}

const principles: { key: PrincipleFilter; label: string; shortLabel: string }[] = [
  { key: 'All', label: 'All Issues', shortLabel: 'All' },
  { key: 'Perceivable', label: 'Perceivable', shortLabel: 'P' },
  { key: 'Operable', label: 'Operable', shortLabel: 'O' },
  { key: 'Understandable', label: 'Understandable', shortLabel: 'U' },
  { key: 'Robust', label: 'Robust', shortLabel: 'R' },
];

const activeColors: Record<PrincipleFilter, string> = {
  All: 'bg-accent text-white',
  Perceivable: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Operable: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Understandable: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  Robust: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export function PourTabs({ active, onChange, counts }: PourTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {principles.map((p) => {
        const isActive = active === p.key;
        return (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
              isActive
                ? `${activeColors[p.key]} border-transparent`
                : 'border-border bg-bg-card text-text-secondary hover:bg-bg-card-hover hover:text-text-primary'
            }`}
          >
            <span className="hidden sm:inline">{p.label}</span>
            <span className="sm:hidden">{p.shortLabel}</span>
            <span
              className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs ${
                isActive
                  ? 'bg-white/20 text-current'
                  : 'bg-bg-secondary text-text-muted'
              }`}
            >
              {counts[p.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
