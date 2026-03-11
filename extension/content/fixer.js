// content/fixer.js
// Reads violations from scanner.js and patches the live DOM.
// Never modifies server source — browser-only rendering layer.

window.AccessiMorph = window.AccessiMorph || {};

window.AccessiMorph.fix = function (violations) {
  const fixLog = {};

  violations.forEach(({ rule, element }) => {
    try {
      switch (rule) {

        // ── Fix 1: Inject empty alt (marks as decorative) ──────────────────
        case "missing-alt": {
          element.setAttribute("alt", "");
          // If img has a title or aria-label use that instead
          const title = element.getAttribute("title");
          if (title) element.setAttribute("alt", title);
          fixLog["missing-alt"] = (fixLog["missing-alt"] || 0) + 1;
          break;
        }

        // ── Fix 2: Inject aria-label on inputs ─────────────────────────────
        case "missing-label": {
          const hint =
            element.getAttribute("placeholder") ||
            element.getAttribute("name") ||
            element.getAttribute("type") ||
            "Input field";
          // Capitalise first letter
          element.setAttribute(
            "aria-label",
            hint.charAt(0).toUpperCase() + hint.slice(1)
          );
          fixLog["missing-label"] = (fixLog["missing-label"] || 0) + 1;
          break;
        }

        // ── Fix 3: Inject lang attribute ───────────────────────────────────
        case "missing-lang": {
          // Best-effort: default to 'en'. User can override in settings.
          element.setAttribute("lang", "en");
          fixLog["missing-lang"] = (fixLog["missing-lang"] || 0) + 1;
          break;
        }

        // ── Fix 4: Add descriptive aria-label to vague links ───────────────
        case "vague-link": {
          const href = element.getAttribute("href") || "";
          // Use surrounding context: parent text or href path
          const parent = element.closest("p, li, td, article, section");
          const context = parent
            ? parent.textContent.trim().slice(0, 60)
            : href;
          if (context) {
            element.setAttribute("aria-label", `Link: ${context}`);
            fixLog["vague-link"] = (fixLog["vague-link"] || 0) + 1;
          }
          break;
        }

        // ── Fix 5: Restore focus indicators ───────────────────────────────
        case "no-focus-indicator": {
          // Remove the inline outline:none — let injected.css handle the rest
          const style = element.getAttribute("style") || "";
          const cleaned = style
            .replace(/outline\s*:\s*none\s*;?/gi, "")
            .replace(/outline\s*:\s*0\s*;?/gi, "")
            .trim();
          element.setAttribute("style", cleaned);
          fixLog["no-focus-indicator"] = (fixLog["no-focus-indicator"] || 0) + 1;
          break;
        }

        // ── Fix 6: Inject skip-to-content link ────────────────────────────
        case "missing-skip-link": {
          // Only inject once
          if (!document.getElementById("accessimorph-skip-link")) {
            const skip = document.createElement("a");
            skip.id = "accessimorph-skip-link";
            skip.href = "#main";
            skip.textContent = "Skip to main content";
            skip.className = "accessimorph-skip-link";
            document.body.prepend(skip);
            fixLog["missing-skip-link"] = 1;
          }
          break;
        }

        // ── Fix 7: Force minimum font size ────────────────────────────────
        case "small-font": {
          element.style.fontSize = "12px";
          fixLog["small-font"] = (fixLog["small-font"] || 0) + 1;
          break;
        }
      }
    } catch (err) {
      // Never crash the page
      console.warn("[AccessiMorph] Fix failed for rule:", rule, err);
    }
  });

  return fixLog;
};
