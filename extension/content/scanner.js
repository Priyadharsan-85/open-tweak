// content/scanner.js
// Scans the live DOM for WCAG 2.1 AA violations.
// Returns an array of violation objects consumed by fixer.js

window.AccessiMorph = window.AccessiMorph || {};

window.AccessiMorph.scan = function () {
  const violations = [];

  // ── Rule 1: Images missing alt attribute ─────────────────────────────────
  const imgsNoAlt = document.querySelectorAll("img:not([alt])");
  imgsNoAlt.forEach((el) => {
    violations.push({ rule: "missing-alt", element: el });
  });

  // ── Rule 2: Inputs missing label / aria-label ────────────────────────────
  const inputs = document.querySelectorAll(
    "input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset'])"
  );
  inputs.forEach((input) => {
    const hasLabel =
      input.labels?.length > 0 ||
      input.getAttribute("aria-label") ||
      input.getAttribute("aria-labelledby") ||
      input.getAttribute("title");
    if (!hasLabel) {
      violations.push({ rule: "missing-label", element: input });
    }
  });

  // ── Rule 3: HTML element missing lang attribute ───────────────────────────
  const html = document.querySelector("html");
  if (html && !html.getAttribute("lang")) {
    violations.push({ rule: "missing-lang", element: html });
  }

  // ── Rule 4: Links with non-descriptive text ───────────────────────────────
  const vagueLinkTexts = ["click here", "here", "read more", "more", "link", "this"];
  document.querySelectorAll("a[href]").forEach((a) => {
    const text = a.textContent.trim().toLowerCase();
    if (vagueLinkTexts.includes(text) && !a.getAttribute("aria-label")) {
      violations.push({ rule: "vague-link", element: a });
    }
  });

  // ── Rule 5: Missing focus indicators (detect inline outline:none) ─────────
  document.querySelectorAll("a, button, input, select, textarea").forEach((el) => {
    const style = el.getAttribute("style") || "";
    if (style.includes("outline") && style.includes("none")) {
      violations.push({ rule: "no-focus-indicator", element: el });
    }
  });

  // ── Rule 6: Missing skip-to-content link ─────────────────────────────────
  const skipLink = document.querySelector('a[href="#main"], a[href="#content"], .skip-link');
  if (!skipLink) {
    violations.push({ rule: "missing-skip-link", element: document.body });
  }

  // ── Rule 7: Low font size (below 12px — aggressive cut) ──────────────────
  const allText = document.querySelectorAll("p, li, td, span, label, a");
  allText.forEach((el) => {
    const size = parseFloat(window.getComputedStyle(el).fontSize);
    if (size > 0 && size < 12) {
      violations.push({ rule: "small-font", element: el });
    }
  });

  return violations;
};
