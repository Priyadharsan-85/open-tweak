import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenTweak Dashboard — WCAG 2.1 Accessibility Auditor',
  description:
    'Audit any public webpage for WCAG 2.1 AA accessibility violations. Get detailed issue reports with code fix suggestions.',
  keywords: ['accessibility', 'WCAG', 'audit', 'a11y', 'web accessibility', 'OpenTweak'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased">
        {/* ── Top Navigation ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-white"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Open<span className="gradient-text">Tweak</span>
              </span>
              <span className="hidden rounded-full border border-border bg-bg-secondary px-2.5 py-0.5 text-xs text-text-muted sm:inline-block">
                Dashboard
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/jeevapriyan10/open-tweak"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border bg-bg-secondary px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-accent hover:text-text-primary"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>
        </header>

        {/* ── Main Content ───────────────────────────────────────────── */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</main>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer className="mt-20 border-t border-border py-8 text-center text-sm text-text-muted">
          <div className="mx-auto max-w-7xl px-4">
            <p>
              Built with ♥ by the{' '}
              <a
                href="https://github.com/jeevapriyan10/open-tweak"
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenTweak
              </a>{' '}
              community · MIT License
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
