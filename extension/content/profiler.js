// content/profiler.js
// Reads the user's chosen profile from chrome.storage and applies
// CSS/JS customizations to every page visited.

window.AccessiMorph = window.AccessiMorph || {};

const PROFILES = {
  "color-blind-deuteranopia": {
    filter: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><filter id='d'><feColorMatrix type='matrix' values='0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0'/></filter></svg>#d\")",
  },
  "color-blind-protanopia": {
    filter: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><filter id='p'><feColorMatrix type='matrix' values='0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0'/></filter></svg>#p\")",
  },
  "low-vision": {
    css: `
      * { font-size: max(1em, 16px) !important; line-height: 1.8 !important; }
      body { max-width: 70ch !important; margin: 0 auto !important; }
    `,
  },
  "dyslexia": {
    css: `
      @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;600&display=swap');
      * {
        font-family: 'Lexend', sans-serif !important;
        letter-spacing: 0.1em !important;
        word-spacing: 0.2em !important;
        text-align: left !important;
        line-height: 1.6 !important;
      }
    `,
  },
  "deaf": {
    // JS-only: flag video/audio elements
    js: () => {
      document.querySelectorAll("video, audio").forEach((media) => {
        if (!media.querySelector("track[kind='captions']")) {
          const badge = document.createElement("div");
          badge.textContent = "⚠️ No captions detected";
          badge.style.cssText =
            "background:#ffcc00;color:#000;padding:4px 8px;font-size:13px;font-weight:bold;border-radius:4px;margin:4px 0;display:inline-block;";
          media.insertAdjacentElement("afterend", badge);
        }
      });
    },
  },
  "focus-mode": {
    css: `
      [class*="ad"], [id*="ad"], [class*="banner"], iframe:not([title]) {
        display: none !important;
      }
      video[autoplay] { autoplay: false !important; }
      * { animation: none !important; transition: none !important; }
    `,
  },
};

window.AccessiMorph.applyProfile = function (profileKey) {
  if (!profileKey || profileKey === "none") return;

  const profile = PROFILES[profileKey];
  if (!profile) return;

  // Apply SVG filter to entire page
  if (profile.filter) {
    document.documentElement.style.filter = profile.filter;
  }

  // Inject CSS
  if (profile.css) {
    const styleId = "accessimorph-profile-style";
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = profile.css;
  }

  // Run JS customization
  if (profile.js) {
    profile.js();
  }
};

// ── Bootstrap ──────────────────────────────────────────────────────────────

chrome.storage.sync.get(["profile", "siteDisabled"], (data) => {
  const currentHost = window.location.hostname;
  const disabled = data.siteDisabled?.[currentHost];
  if (disabled) return;

  // Run scan → fix → profile in sequence
  const violations = window.AccessiMorph.scan();
  const fixLog = window.AccessiMorph.fix(violations);
  window.AccessiMorph.applyProfile(data.profile || "none");

  // Store fix log for this URL
  const fixCount = Object.values(fixLog).reduce((a, b) => a + b, 0);
  chrome.storage.local.set({
    [`fixLog:${currentHost}`]: {
      timestamp: new Date().toISOString(),
      fixes: fixLog,
      count: fixCount,
    },
  });

  // Tell background service worker to update badge
  chrome.runtime.sendMessage({ type: "FIX_COUNT", count: fixCount });
});
