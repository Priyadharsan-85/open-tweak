// ── WCAG 2.1 Contrast Utilities ─────────────────────────────────────────
// Pure TypeScript — no dependencies. Implements the relative luminance
// and contrast ratio algorithms from WCAG 2.1 §1.4.3.

/**
 * Parse a hex color string to RGB components.
 * Supports #RGB, #RRGGBB, #RRGGBBAA formats.
 */
export function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '');
  let r: number, g: number, b: number;

  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else if (cleaned.length === 6 || cleaned.length === 8) {
    r = parseInt(cleaned.substring(0, 2), 16);
    g = parseInt(cleaned.substring(2, 4), 16);
    b = parseInt(cleaned.substring(4, 6), 16);
  } else {
    return null;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

/**
 * Parse an rgb()/rgba() CSS color string to RGB components.
 */
export function parseRGBColor(colorStr: string): { r: number; g: number; b: number } | null {
  const match = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!match) return null;
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
  };
}

/**
 * Parse any CSS color string we can handle (hex or rgb/rgba).
 */
export function parseColor(colorStr: string): { r: number; g: number; b: number } | null {
  const trimmed = colorStr.trim().toLowerCase();
  if (trimmed.startsWith('#')) {
    return parseHexColor(trimmed);
  }
  if (trimmed.startsWith('rgb')) {
    return parseRGBColor(trimmed);
  }
  // Named colors — just handle the most common ones for inline style analysis
  const namedColors: Record<string, { r: number; g: number; b: number }> = {
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 128, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    yellow: { r: 255, g: 255, b: 0 },
    gray: { r: 128, g: 128, b: 128 },
    grey: { r: 128, g: 128, b: 128 },
  };
  return namedColors[trimmed] ?? null;
}

/**
 * Convert a single sRGB channel value (0–255) to its linear value.
 */
function linearize(channel: number): number {
  const s = channel / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Calculate the relative luminance of an sRGB color.
 * WCAG 2.1 §1.4.3, formula from https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function relativeLuminance(color: { r: number; g: number; b: number }): number {
  return 0.2126 * linearize(color.r) + 0.7152 * linearize(color.g) + 0.0722 * linearize(color.b);
}

/**
 * Calculate the contrast ratio between two colors.
 * Returns a value between 1 and 21.
 */
export function getContrastRatio(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a contrast ratio meets WCAG AA for normal text (4.5:1).
 */
export function meetsAA(ratio: number): boolean {
  return ratio >= 4.5;
}

/**
 * Check if a contrast ratio meets WCAG AA for large text (3:1).
 */
export function meetsAALarge(ratio: number): boolean {
  return ratio >= 3;
}
