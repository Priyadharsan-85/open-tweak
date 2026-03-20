"use client";

import { AlertCircle, ChevronRight, Info, ExternalLink, Globe, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getResult } from "@/lib/store";
import { AuditResult } from "@/lib/types";

export default function ReportPage() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getResult();
    setResult(data);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">No report found</h1>
        <p className="text-text-secondary">Please scan a website first.</p>
        <Link href="/" className="btn-primary py-2 px-6 rounded-lg bg-accent text-white">Go to Scan</Link>
      </div>
    );
  }

  const criticalIssues = result.issues.filter(i => i.severity === 'critical');
  const seriousIssues = result.issues.filter(i => i.severity === 'serious');
  const otherIssues = result.issues.filter(i => i.severity !== 'critical' && i.severity !== 'serious');

  return (
    <div className="mx-auto max-w-4xl py-12 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-border pb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted">
            <Globe size={14} /> Audit Report
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{new URL(result.url).hostname}</h1>
          <p className="text-text-secondary flex items-center gap-2">
            Analyzed {new Date(result.fetchedAt).toLocaleDateString()} • <a href={result.url} target="_blank" className="text-accent hover:underline flex items-center gap-1">Open link <ExternalLink size={12}/></a>
          </p>
        </div>
        
        <div className="flex items-center gap-6 rounded-2xl border border-border bg-bg-card p-6 shadow-sm">
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">Health Score</div>
            <div className={`font-black text-2xl tracking-tighter italic ${result.score < 70 ? 'text-severity-critical' : 'text-success'}`}>
              {result.score < 70 ? 'ACTION REQUIRED' : 'LOOKING GOOD'}
            </div>
          </div>
          <div className="relative flex h-20 w-20 items-center justify-center">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle
                className="text-bg-secondary stroke-current"
                strokeWidth="10"
                cx="50" cy="50" r="40" fill="transparent"
              ></circle>
              <circle
                className={`${result.score < 50 ? 'text-severity-critical' : result.score < 80 ? 'text-severity-serious' : 'text-success'} stroke-current transition-all duration-1000 ease-out`}
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * result.score / 100)}
                strokeLinecap="round"
                cx="50" cy="50" r="40" fill="transparent"
              ></circle>
            </svg>
            <span className="absolute text-2xl font-black">{result.score}</span>
          </div>
        </div>
      </div>

      {/* Issues Section */}
      <div className="grid gap-12">
        {/* Critical Issues */}
        {criticalIssues.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-severity-critical/10 text-severity-critical border border-severity-critical/20">
                <AlertCircle size={22} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Critical Issues <span className="text-text-muted font-medium ml-2 text-lg">({criticalIssues.length})</span></h2>
            </div>
            
            <div className="grid gap-4">
              {criticalIssues.map((issue, idx) => (
                <IssueCard key={idx} title={issue.title ?? issue.wcagTitle} desc={issue.description ?? issue.message} severity="critical" />
              ))}
            </div>
          </section>
        )}

        {/* Serious Issues */}
        {seriousIssues.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-severity-serious/10 text-severity-serious border border-severity-serious/20">
                <Info size={22} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">High Priority <span className="text-text-muted font-medium ml-2 text-lg">({seriousIssues.length})</span></h2>
            </div>
            
            <div className="grid gap-4">
              {seriousIssues.map((issue, idx) => (
                <IssueCard key={idx} title={issue.title ?? issue.wcagTitle} desc={issue.description ?? issue.message} severity="serious" />
              ))}
            </div>
          </section>
        )}

        {/* Other Issues */}
        {otherIssues.length > 0 && (
          <section className="space-y-6 opacity-75">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-secondary text-text-muted border border-border">
                <Info size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-text-muted">Improvements <span className="font-medium ml-2 text-lg">({otherIssues.length})</span></h2>
            </div>
            
            <div className="grid gap-4">
              {otherIssues.map((issue, idx) => (
                <IssueCard key={idx} title={issue.title ?? issue.wcagTitle} desc={issue.description ?? issue.message} severity="serious" />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* CTA Box */}
      <div className="glow-accent relative mt-16 overflow-hidden rounded-3xl border border-border bg-bg-card p-10 text-center md:text-left">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl space-y-4">
            <h3 className="text-3xl font-bold tracking-tight">Ready to fix these?</h3>
            <p className="text-lg text-text-secondary">
              Don't let accessibility keep customers away. Assign these issues to your developer and track their progress in real-time.
            </p>
          </div>
          <Link href="/track" className="group flex h-16 items-center gap-3 rounded-2xl bg-accent px-10 text-lg font-bold text-white transition-all hover:bg-accent-hover hover:scale-[1.02] active:scale-95 shadow-xl shadow-accent/20">
            Assign to Developer
            <ChevronRight className="transition-transform group-hover:translate-x-1" size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function IssueCard({ title, desc, severity }: { title: string, desc: string, severity: 'critical' | 'serious' }) {
  const isCritical = severity === 'critical';
  const colorClass = isCritical ? 'text-severity-critical' : 'text-severity-serious';
  const borderClass = isCritical ? 'hover:border-severity-critical/30' : 'hover:border-severity-serious/30';
  const bgClass = isCritical ? 'bg-severity-critical/5' : 'bg-severity-serious/5';
  
  return (
    <div className={`glass-card flex items-start gap-5 p-6 transition-all ${borderClass} ${bgClass} shadow-sm`}>
      <div className={`mt-1 shrink-0 ${colorClass}`}>
        {isCritical ? <AlertCircle size={22} /> : <Info size={22} />}
      </div>
      <div className="space-y-2">
        <h4 className="text-lg font-bold text-text-primary leading-tight">{title}</h4>
        <p className="text-sm leading-relaxed text-text-secondary">{desc}</p>
      </div>
    </div>
  );
}
