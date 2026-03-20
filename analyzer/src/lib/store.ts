"use client";

import { AuditResult } from "./types";

const STORAGE_KEY = "opentweak_analyzer_result";

export function saveResult(result: AuditResult) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  }
}

export function getResult(): AuditResult | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

export function clearResult() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
