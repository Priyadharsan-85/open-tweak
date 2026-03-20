"use client";

import { Calendar, CheckCircle2, Mail, Send, ArrowLeft, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getResult } from "@/lib/store";
import { AuditResult } from "@/lib/types";

export default function TrackPage() {
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

  const issues = result.issues;
  // Mock some progress for demonstration based on real issues
  const fixedCount = Math.floor(issues.length * 0.25); 
  const progressPercent = issues.length > 0 ? Math.round((fixedCount / issues.length) * 100) : 100;

  return (
    <div className="mx-auto max-w-5xl py-12 space-y-12 animate-slide-up">
      {/* Back Button & Title */}
      <div className="space-y-4">
        <Link href="/report" className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors">
          <ArrowLeft size={16} /> Back to report
        </Link>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Assign & Track</h1>
          <p className="text-lg text-text-secondary">Delegate accessibility tasks to your team and monitor progress for {new URL(result.url).hostname}.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Assignment Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20">
                <Mail size={20} />
              </div>
              <h2 className="text-xl font-bold">New Assignment</h2>
            </div>

            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Developer Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="dev-team@yourcompany.com"
                    className="w-full rounded-xl border border-border bg-bg-secondary py-4 pl-12 pr-4 text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Set Deadline</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={18} />
                  <input
                    type="date"
                    defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-border bg-bg-secondary py-4 pl-12 pr-4 text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
              </div>

              <button type="button" className="flex w-full items-center justify-center gap-3 rounded-xl bg-accent py-4 font-bold text-white transition-all hover:bg-accent-hover active:scale-[0.98] shadow-lg shadow-accent/20">
                <Send size={18} /> Send Assignment
              </button>
            </form>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card p-8 space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success border border-success/20">
                  <CheckCircle2 size={20} />
                </div>
                <h2 className="text-xl font-bold">Fix Progress</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-success border border-success/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                Live Tracking
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <div className="text-3xl font-black italic tracking-tighter text-text-primary">{progressPercent}% DONE</div>
                  <div className="text-sm text-text-muted font-medium">{fixedCount} of {issues.length} accessibility issues resolved</div>
                </div>
                <div className="text-sm font-bold text-accent">{issues.length - fixedCount} issues remaining</div>
              </div>
              <div className="h-4 w-full rounded-full bg-bg-secondary p-1 border border-border overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-accent to-purple-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Activity List */}
            <div className="space-y-5 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Task List</h3>
              <div className="space-y-4">
                {issues.length > 0 ? issues.map((issue, idx) => (
                  <ActivityItem 
                    key={idx}
                    title={issue.title ?? issue.wcagTitle} 
                    time={idx < fixedCount ? "Fixed" : "Pending"} 
                    status={idx < fixedCount ? "completed" : idx === fixedCount ? "in-progress" : "pending"} 
                  />
                )) : (
                  <div className="text-center py-8 text-text-muted">No issues found. Everything is looking good!</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ title, time, status }: { title: string, time: string, status: 'completed' | 'in-progress' | 'pending' }) {
  return (
    <div className={`flex items-center gap-4 rounded-xl border border-transparent p-3 transition-colors hover:bg-bg-secondary/50 ${status === 'in-progress' ? 'bg-accent/5 border-accent/10' : ''}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
        status === 'completed' ? 'bg-success/10 text-success border-success/20' :
        status === 'in-progress' ? 'bg-accent/10 text-accent border-accent/20 animate-pulse' :
        'bg-bg-secondary text-text-muted border-border'
      }`}>
        {status === 'completed' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
      </div>
      <div className="flex flex-1 items-center justify-between gap-4">
        <span className={`text-sm font-medium ${status === 'pending' ? 'text-text-muted' : 'text-text-primary'}`}>
          {title}
        </span>
        <span className="text-xs font-medium text-text-muted tabular-nums uppercase tracking-tighter">
          {time}
        </span>
      </div>
    </div>
  );
}
