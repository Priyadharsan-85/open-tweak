// ── Severity levels ─────────────────────────────────────────────────────
export type Severity = 'critical' | 'serious' | 'moderate' | 'minor';

// ── POUR Principles ─────────────────────────────────────────────────────
export type Principle = 'Perceivable' | 'Operable' | 'Understandable' | 'Robust';

// ── Code fix language ──────────────────────────────────────────────────
export type FixLanguage = 'html' | 'css';

// ── Fix code before/after ───────────────────────────────────────────────
export interface FixCode {
  before: string;
  after: string;
  language: FixLanguage;
}

// ── Single instance of an issue found on the page ───────────────────────
export interface IssueInstance {
  element: string;       // the offending HTML snippet
  selector: string;      // CSS selector path
  fixCode: FixCode;
}

// ── Aggregated issue (one per rule) ─────────────────────────────────────
export interface Issue {
  id: string;                     // rule ID e.g. "missing-alt"
  wcagCriterion: string;          // e.g. "1.1.1"
  wcagTitle: string;              // e.g. "Non-text Content"
  principle: Principle;
  severity: Severity;
  count: number;                  // how many instances found
  instances: IssueInstance[];     // first 5 max
  message: string;                // human-readable description
  howToFix: string;               // short instruction
  wcagUrl: string;                // link to WCAG understanding doc
}

// ── Summary counts ─────────────────────────────────────────────────────
export interface AuditSummary {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  total: number;
  passed: number;
}

// ── Full audit result ──────────────────────────────────────────────────
export interface AuditResult {
  url: string;
  fetchedAt: string;      // ISO timestamp
  pageTitle: string;
  score: number;           // 0–100
  summary: AuditSummary;
  issues: Issue[];
}

// ── API error response ─────────────────────────────────────────────────
export interface AuditError {
  error: string;
  details?: string;
}

// ── Rule definition (internal) ─────────────────────────────────────────
export interface RuleDefinition {
  id: string;
  wcagCriterion: string;
  wcagTitle: string;
  principle: Principle;
  severity: Severity;
  message: string;
  howToFix: string;
  wcagUrl: string;
}

// ── Raw issue instance returned by a rule checker ──────────────────────
export interface RawIssueInstance {
  element: string;
  selector: string;
}
