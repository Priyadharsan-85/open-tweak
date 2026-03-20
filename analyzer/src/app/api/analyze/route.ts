import { NextRequest, NextResponse } from 'next/server';
import { runAudit, TOTAL_RULES } from '@/lib/wcag-rules';
import { translateIssue } from '@/lib/translator';
import type { AuditResult, AuditError, Severity } from '@/lib/types';
import * as cheerio from 'cheerio';

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'OpenTweak-Analyzer/0.1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawUrl = body.url;

    if (!rawUrl) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    const url = normalizeUrl(rawUrl);

    const response = await fetchWithTimeout(url, 15000);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch the website' }, { status: 502 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const pageTitle = $('title').first().text().trim() || 'Untitled Page';

    const rawIssues = runAudit(html);
    
    // Map to non-technical issues
    const issues = rawIssues.map(issue => {
      const { title, description } = translateIssue(issue.id, issue.wcagTitle);
      return {
        ...issue,
        title, // Simplified title
        description // Simplified description
      };
    });

    const passedRules = TOTAL_RULES - issues.length;
    const score = Math.round((passedRules / TOTAL_RULES) * 100);

    const summary = {
      critical: issues.filter(i => i.severity === 'critical').length,
      serious: issues.filter(i => i.severity === 'serious').length,
      moderate: issues.filter(i => i.severity === 'moderate').length,
      minor: issues.filter(i => i.severity === 'minor').length,
      total: issues.length,
      passed: passedRules,
    };

    return NextResponse.json({
      url,
      pageTitle,
      score,
      summary,
      issues
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
