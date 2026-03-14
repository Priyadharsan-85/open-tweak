# OpenTweak Dashboard

A web-based WCAG 2.1 AA accessibility auditor. Paste any public URL and get a full audit report with issue details and code fix suggestions.

## Features

- **22 WCAG 2.1 AA rules** — checks for missing alt text, low contrast, missing labels, landmarks, and more
- **Code fix suggestions** — syntax-highlighted before/after code snippets for every issue
- **Server-side analysis** — fetches and analyzes HTML server-side via Next.js API route (no CORS issues)
- **Filter & sort** — filter issues by POUR principle (Perceivable, Operable, Understandable, Robust) and severity
- **Dark mode UI** — professional, minimal dark theme with animated score ring

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS v3
- Cheerio (server-side HTML parsing)
- prism-react-renderer (syntax highlighting)

## Run Locally

```bash
cd dashboard
pnpm install
pnpm dev
# Open http://localhost:3001
```

## Build

```bash
pnpm build
pnpm start
```

## API

### `POST /api/analyze`

```json
{
  "url": "https://example.com"
}
```

Returns a structured `AuditResult` JSON with score, summary, and detailed issues with fix suggestions.
