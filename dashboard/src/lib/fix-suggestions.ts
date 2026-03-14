// ── Fix Suggestions ─────────────────────────────────────────────────────
// Maps each rule ID to a before/after code fix snippet.

import type { FixCode } from './types';

interface FixTemplate {
  before: string;
  after: string;
  language: 'html' | 'css';
}

const FIX_TEMPLATES: Record<string, FixTemplate> = {
  'missing-alt': {
    before: '<img src="hero.jpg">',
    after: '<!-- For decorative images: -->\n<img src="hero.jpg" alt="">\n\n<!-- For meaningful images: -->\n<img src="hero.jpg" alt="Describe what the image shows">',
    language: 'html',
  },
  'empty-alt-meaningful': {
    before: '<a href="/product">\n  <img src="product.jpg" alt="">\n</a>',
    after: '<a href="/product">\n  <img src="product.jpg" alt="Product name - brief description">\n</a>',
    language: 'html',
  },
  'low-contrast': {
    before: '/* Contrast ratio below 4.5:1 */\ncolor: #aaa;\nbackground-color: #fff;',
    after: '/* Passes WCAG AA 4.5:1 ratio */\ncolor: #767676;\nbackground-color: #ffffff;',
    language: 'css',
  },
  'missing-label': {
    before: '<input type="email" placeholder="Email">',
    after: '<label for="email">Email address</label>\n<input type="email" id="email" placeholder="Email">',
    language: 'html',
  },
  'missing-lang': {
    before: '<html>',
    after: '<html lang="en">',
    language: 'html',
  },
  'empty-lang': {
    before: '<html lang="">',
    after: '<html lang="en">',
    language: 'html',
  },
  'non-descriptive-links': {
    before: '<a href="/report">Click here</a>',
    after: '<a href="/report">View the accessibility report</a>\n\n<!-- Or use aria-label: -->\n<a href="/report" aria-label="View the accessibility report">Report</a>',
    language: 'html',
  },
  'missing-focus-style': {
    before: 'button:focus {\n  outline: none;\n}',
    after: 'button:focus {\n  outline: 2px solid #6366f1;\n  outline-offset: 2px;\n}\n\n/* Or use a custom focus style: */\nbutton:focus-visible {\n  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5);\n}',
    language: 'css',
  },
  'missing-skip-link': {
    before: '<body>\n  <nav>...</nav>\n  <main id="main">...</main>\n</body>',
    after: '<body>\n  <a href="#main" class="skip-link">\n    Skip to main content\n  </a>\n  <nav>...</nav>\n  <main id="main">...</main>\n</body>\n\n/* CSS for skip link: */\n.skip-link {\n  position: absolute;\n  top: -40px;\n  left: 0;\n  padding: 8px;\n  z-index: 100;\n}\n.skip-link:focus {\n  top: 0;\n}',
    language: 'html',
  },
  'small-font-size': {
    before: '<p style="font-size: 10px;">Small text</p>',
    after: '<p style="font-size: 1rem;">Readable text</p>\n\n<!-- Use relative units for better scaling: -->\n<p style="font-size: 0.875rem;">Minimum readable text</p>',
    language: 'html',
  },
  'missing-form-fieldset': {
    before: '<div>\n  <input type="radio" name="size" value="s"> Small\n  <input type="radio" name="size" value="m"> Medium\n  <input type="radio" name="size" value="l"> Large\n</div>',
    after: '<fieldset>\n  <legend>Select a size</legend>\n  <input type="radio" name="size" id="s" value="s">\n  <label for="s">Small</label>\n  <input type="radio" name="size" id="m" value="m">\n  <label for="m">Medium</label>\n  <input type="radio" name="size" id="l" value="l">\n  <label for="l">Large</label>\n</fieldset>',
    language: 'html',
  },
  'video-no-captions': {
    before: '<video src="intro.mp4" controls></video>',
    after: '<video src="intro.mp4" controls>\n  <track\n    kind="captions"\n    src="intro-captions.vtt"\n    srclang="en"\n    label="English"\n    default\n  />\n</video>',
    language: 'html',
  },
  'audio-no-transcript': {
    before: '<audio src="podcast.mp3" controls></audio>',
    after: '<audio src="podcast.mp3" controls></audio>\n<details>\n  <summary>View transcript</summary>\n  <p>Full text transcript of the audio content...</p>\n</details>',
    language: 'html',
  },
  'missing-main-landmark': {
    before: '<body>\n  <div class="content">...</div>\n</body>',
    after: '<body>\n  <main>\n    <div class="content">...</div>\n  </main>\n</body>',
    language: 'html',
  },
  'missing-nav-landmark': {
    before: '<div class="menu">\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n</div>',
    after: '<nav aria-label="Main navigation">\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n</nav>',
    language: 'html',
  },
  'empty-button': {
    before: '<button class="close-btn">\n  <svg>...</svg>\n</button>',
    after: '<button class="close-btn" aria-label="Close dialog">\n  <svg aria-hidden="true">...</svg>\n</button>',
    language: 'html',
  },
  'missing-table-headers': {
    before: '<table>\n  <tr>\n    <td>Name</td>\n    <td>Age</td>\n  </tr>\n  <tr>\n    <td>Alice</td>\n    <td>30</td>\n  </tr>\n</table>',
    after: '<table>\n  <thead>\n    <tr>\n      <th scope="col">Name</th>\n      <th scope="col">Age</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Alice</td>\n      <td>30</td>\n    </tr>\n  </tbody>\n</table>',
    language: 'html',
  },
  'positive-tabindex': {
    before: '<div tabindex="5">Custom tab order</div>',
    after: '<!-- Use tabindex="0" to add to natural tab order -->\n<div tabindex="0">Natural tab order</div>\n\n<!-- Or use tabindex="-1" for programmatic focus only -->\n<div tabindex="-1">Programmatically focusable</div>',
    language: 'html',
  },
  'duplicate-id': {
    before: '<div id="header">First header</div>\n<div id="header">Second header</div>',
    after: '<div id="page-header">First header</div>\n<div id="section-header">Second header</div>',
    language: 'html',
  },
  'missing-title': {
    before: '<head>\n  <meta charset="utf-8">\n</head>',
    after: '<head>\n  <meta charset="utf-8">\n  <title>Page Title — Site Name</title>\n</head>',
    language: 'html',
  },
  'autoplay-media': {
    before: '<video autoplay src="hero.mp4"></video>',
    after: '<!-- Option 1: Add muted attribute -->\n<video autoplay muted src="hero.mp4"></video>\n\n<!-- Option 2: Remove autoplay -->\n<video src="hero.mp4" controls></video>',
    language: 'html',
  },
  'meta-refresh': {
    before: '<meta http-equiv="refresh" content="5;url=/new-page">',
    after: '<!-- Remove meta refresh. Use server-side redirect instead: -->\n<!-- HTTP 301/302 redirect in your server config -->\n\n<!-- If a timed redirect is necessary, inform the user: -->\n<p>This page will redirect in 5 seconds.\n  <a href="/new-page">Go to the new page now</a>.\n</p>',
    language: 'html',
  },
};

/**
 * Get a fix suggestion for a given rule and element.
 * Uses the template if available, otherwise provides the generic fix.
 */
export function getFixSuggestion(ruleId: string, _element: string): FixCode {
  const template = FIX_TEMPLATES[ruleId];
  if (template) {
    return {
      before: template.before,
      after: template.after,
      language: template.language,
    };
  }
  // Fallback — should not happen if all rules are covered
  return {
    before: '<!-- No specific fix available -->',
    after: '<!-- Review WCAG guidelines for this issue -->',
    language: 'html',
  };
}

/**
 * Get all fix template keys (for validation).
 */
export function getAllFixRuleIds(): string[] {
  return Object.keys(FIX_TEMPLATES);
}
