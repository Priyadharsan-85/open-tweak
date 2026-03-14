'use client';

import { useState, useRef } from 'react';
import type { AuditResult, AuditError, Issue, Principle, Severity } from '@/lib/types';
import { UrlInput } from '@/components/url-input';
import { AuditSummary } from '@/components/audit-summary';
import { IssueList } from '@/components/issue-list';
import { FixPanel } from '@/components/fix-panel';
import { PourTabs } from '@/components/pour-tabs';
import { SeverityFilter } from '@/components/severity-filter';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { EmptyState } from '@/components/empty-state';

type PrincipleFilter = Principle | 'All';
type SeverityFilterType = Severity | 'All';

export default function HomePage() {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<AuditError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [activePrinciple, setActivePrinciple] = useState<PrincipleFilter>('All');
  const [activeSeverity, setActiveSeverity] = useState<SeverityFilterType>('All');
  const resultsRef = useRef<HTMLDivElement>(null);

  async function handleAnalyze(url: string) {
    setIsLoading(true);
    setError(null);
    setAuditResult(null);
    setSelectedIssue(null);
    setActivePrinciple('All');
    setActiveSeverity('All');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data as AuditError);
      } else {
        setAuditResult(data as AuditResult);
        // Scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch {
      setError({ error: 'Network error', details: 'Could not connect to the analysis server.' });
    } finally {
      setIsLoading(false);
    }
  }

  // Calculate counts for filters
  function getPrincipleCounts(issues: Issue[]): Record<PrincipleFilter, number> {
    const counts: Record<PrincipleFilter, number> = {
      All: issues.length,
      Perceivable: 0,
      Operable: 0,
      Understandable: 0,
      Robust: 0,
    };
    for (const issue of issues) {
      counts[issue.principle]++;
    }
    return counts;
  }

  function getSeverityCounts(issues: Issue[]): Record<SeverityFilterType, number> {
    const counts: Record<SeverityFilterType, number> = {
      All: issues.length,
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    };
    for (const issue of issues) {
      counts[issue.severity]++;
    }
    return counts;
  }

  const showResults = auditResult && !isLoading;
  const showError = error && !isLoading;
  const showIdle = !auditResult && !error && !isLoading;

  return (
    <div className="py-8 sm:py-12">
      {/* ── Hero Section ───────────────────────────────────────────── */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          WCAG 2.1 <span className="gradient-text">Accessibility</span> Auditor
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-base text-text-secondary sm:text-lg">
          Paste any public URL and instantly get a comprehensive accessibility audit report
          with detailed issues and ready-to-use code fixes.
        </p>

        {/* URL Input */}
        <div className="mx-auto max-w-2xl">
          <UrlInput onSubmit={handleAnalyze} isLoading={isLoading} />
        </div>
      </section>

      {/* ── Results Area ───────────────────────────────────────────── */}
      <div ref={resultsRef}>
        {/* Loading state */}
        {isLoading && <SkeletonLoader />}

        {/* Idle state */}
        {showIdle && <EmptyState type="idle" />}

        {/* Error state */}
        {showError && (
          <EmptyState type="error" message={error.error} details={error.details} />
        )}

        {/* Results */}
        {showResults && (
          <div className="animate-fade-in space-y-6">
            {/* Audit Summary */}
            <AuditSummary
              score={auditResult.score}
              summary={auditResult.summary}
              pageTitle={auditResult.pageTitle}
              url={auditResult.url}
            />

            {/* Filters */}
            <div className="space-y-3">
              <PourTabs
                active={activePrinciple}
                onChange={setActivePrinciple}
                counts={getPrincipleCounts(auditResult.issues)}
              />
              <SeverityFilter
                active={activeSeverity}
                onChange={setActiveSeverity}
                counts={getSeverityCounts(auditResult.issues)}
              />
            </div>

            {/* Issues + Fix Panel */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              {/* Issue list */}
              <div className="lg:col-span-3">
                <IssueList
                  issues={auditResult.issues}
                  selectedIssue={selectedIssue}
                  onSelectIssue={setSelectedIssue}
                  activePrinciple={activePrinciple}
                  activeSeverity={activeSeverity}
                />
              </div>

              {/* Fix panel (sticky) */}
              <div className="lg:col-span-2">
                <div className="sticky top-20">
                  <FixPanel issue={selectedIssue} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
