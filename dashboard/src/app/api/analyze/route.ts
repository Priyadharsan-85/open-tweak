// ── POST /api/analyze ───────────────────────────────────────────────────
// Fetches a public URL, runs the WCAG 2.1 AA audit, returns structured JSON.

import { NextRequest, NextResponse } from 'next/server';
import { runAudit, TOTAL_RULES } from '@/lib/wcag-rules';
import type { AuditResult, AuditError, AuditSummary, Severity } from '@/lib/types';
import * as cheerio from 'cheerio';

// ── URL normalization ───────────────────────────────────────────────────
function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

// ── URL validation ──────────────────────────────────────────────────────
function isValidUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// ── Fetch with timeout ──────────────────────────────────────────────────
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'OpenTweak-Dashboard/0.1.0 (WCAG Accessibility Auditor)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// ── POST handler ────────────────────────────────────────────────────────
export async function POST(request: NextRequest): Promise<NextResponse<AuditResult | AuditError>> {
  try {
    // Parse request body
    const body = await request.json() as { url?: string };
    const rawUrl = body.url;

    if (!rawUrl || typeof rawUrl !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid URL', details: 'Please provide a valid URL in the request body.' },
        { status: 400 }
      );
    }

    const url = normalizeUrl(rawUrl);

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL', details: `"${rawUrl}" is not a valid URL.` },
        { status: 400 }
      );
    }

    // Fetch the target page
    let response: Response;
    try {
      response = await fetchWithTimeout(url, 10000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('abort')) {
        return NextResponse.json(
          { error: 'Request timeout', details: 'The target URL took longer than 10 seconds to respond.' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { error: 'Fetch failed', details: `Could not fetch the URL: ${message}` },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: 'HTTP error', details: `The server returned HTTP ${response.status} ${response.statusText}.` },
        { status: 502 }
      );
    }

    // Verify content type
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return NextResponse.json(
        { error: 'Not an HTML page', details: `The URL returned content-type "${contentType}" instead of HTML.` },
        { status: 400 }
      );
    }

    // Read the HTML
    const html = await response.text();

    // Extract page title
    const $ = cheerio.load(html);
    const pageTitle = $('title').first().text().trim() || 'Untitled Page';

    // Run the WCAG audit
    const issues = runAudit(html);

    // Calculate score and summary
    const failedRules = issues.length;
    const passedRules = TOTAL_RULES - failedRules;
    const score = Math.round((passedRules / TOTAL_RULES) * 100);

    const summary: AuditSummary = {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
      total: issues.reduce((sum, issue) => sum + issue.count, 0),
      passed: passedRules,
    };

    for (const issue of issues) {
      summary[issue.severity as Severity]++;
    }

    const result: AuditResult = {
      url,
      fetchedAt: new Date().toISOString(),
      pageTitle,
      score,
      summary,
      issues,
    };

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: 'Internal error', details: message },
      { status: 500 }
    );
  }
}
