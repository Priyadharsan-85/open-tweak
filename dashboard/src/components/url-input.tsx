'use client';

import { useState } from 'react';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();

    if (!trimmed) {
      setError('Please enter a URL');
      return;
    }

    // Basic URL validation
    let normalized = trimmed;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }

    try {
      new URL(normalized);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setError('');
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`group relative flex items-center rounded-2xl border transition-all duration-300 ${
        error
          ? 'border-severity-critical/50 bg-severity-critical/5'
          : 'border-border bg-bg-card focus-within:border-accent/50 focus-within:shadow-lg focus-within:shadow-accent/5 hover:border-accent/30'
      }`}>
        {/* Search icon */}
        <div className="flex items-center pl-4 pr-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-text-muted transition-colors group-focus-within:text-accent"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError('');
          }}
          placeholder="Enter any public URL — e.g. https://example.com"
          className="flex-1 bg-transparent py-4 text-sm text-text-primary outline-none placeholder:text-text-muted/60"
          disabled={isLoading}
          id="url-input"
          autoComplete="url"
          aria-label="Website URL to audit"
          aria-invalid={!!error}
          aria-describedby={error ? 'url-error' : undefined}
        />

        {/* Submit button */}
        <div className="pr-2">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            id="analyze-button"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                </svg>
                <span>Analyzing…</span>
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span className="hidden sm:inline">Analyze Accessibility</span>
                <span className="sm:hidden">Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p id="url-error" className="mt-2 text-xs text-severity-critical animate-fade-in">{error}</p>
      )}
    </form>
  );
}
