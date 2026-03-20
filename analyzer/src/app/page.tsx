"use client";

import { Search, ShieldCheck, Zap, Globe, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveResult } from "@/lib/store";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to analyze website");
      }

      const result = await res.json();
      saveResult(result);
      router.push("/report");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem-12rem)] flex-col items-center justify-center py-20">
      <div className="w-full max-w-3xl space-y-12 animate-slide-up">
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-4 py-1.5 text-sm font-medium text-accent">
            <ShieldCheck size={16} />
            <span>Accessibility for Everyone</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            Is your website <span className="gradient-text">accessible?</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-text-secondary sm:text-xl">
            Get a simple, non-technical report on your website's accessibility. 
            No code, no jargon, just results.
          </p>
        </div>

        {/* Search Box */}
        <div className="relative mx-auto max-w-2xl">
          <div className="glow-accent absolute -inset-1 rounded-2xl bg-gradient-to-r from-accent/20 to-purple-500/20 blur opacity-75"></div>
          <form onSubmit={handleScan} className="relative flex flex-col gap-3 rounded-2xl border border-border bg-bg-card p-2 sm:flex-row sm:gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-muted">
                <Globe size={20} />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourbusiness.com"
                disabled={loading}
                className="w-full bg-transparent border-none py-4 pl-12 pr-4 text-text-primary placeholder:text-text-muted focus:ring-0 outline-none text-lg"
              />
            </div>
            <button 
              type="submit"
              disabled={loading || !url}
              className="rounded-xl bg-accent px-8 py-4 font-semibold text-white transition-all hover:bg-accent-hover hover:scale-[1.02] active:scale-95 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Scan Website"}
            </button>
          </form>
          {error && (
            <p className="mt-4 text-center text-severity-critical text-sm font-medium animate-fade-in">
              {error}
            </p>
          )}
          <p className="mt-4 text-center text-sm text-text-muted">
            No account needed • Free forever • WCAG 2.1 Ready
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 pt-12 sm:grid-cols-3">
          <FeatureCard 
            icon={<ShieldCheck className="text-accent" />}
            title="Simple Reports"
            desc="We translate complex technical issues into plain English anyone can understand."
          />
          <FeatureCard 
            icon={<Zap className="text-amber-500" />}
            title="Quick Fixes"
            desc="Actionable steps to improve your site's accessibility and reach more customers."
          />
          <FeatureCard 
            icon={<Search className="text-emerald-500" />}
            title="Task Tracking"
            desc="Assign issues to your developer and track progress as they get fixed."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-card group p-6 transition-all hover:border-accent/50 hover:bg-bg-card-hover">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bg-secondary border border-border group-hover:border-accent/30 group-hover:bg-accent/5 transition-colors">
        {icon}
      </div>
      <h3 className="mb-2 font-bold text-text-primary">{title}</h3>
      <p className="text-sm leading-relaxed text-text-secondary">{desc}</p>
    </div>
  );
}
