// ── WCAG 2.1 AA Rule Engine ─────────────────────────────────────────────
// Runs server-side on raw HTML using cheerio. Returns structured issues.

import * as cheerio from 'cheerio';
import type { Element, Node as DomNode } from 'domhandler';
import type { RuleDefinition, RawIssueInstance, Issue, IssueInstance } from './types';
import { parseColor, getContrastRatio } from './contrast';
import { getFixSuggestion } from './fix-suggestions';

// ── Rule Definitions ────────────────────────────────────────────────────
const RULES: RuleDefinition[] = [
  {
    id: 'missing-alt',
    wcagCriterion: '1.1.1',
    wcagTitle: 'Non-text Content',
    principle: 'Perceivable',
    severity: 'critical',
    message: 'Image is missing an alt attribute. Screen readers cannot describe the image to users.',
    howToFix: 'Add an alt attribute with a descriptive text, or alt="" if the image is decorative.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
  },
  {
    id: 'empty-alt-meaningful',
    wcagCriterion: '1.1.1',
    wcagTitle: 'Non-text Content',
    principle: 'Perceivable',
    severity: 'serious',
    message: 'Image has an empty alt attribute but may be meaningful (inside a link or with a content-related class).',
    howToFix: 'If the image conveys meaning, add descriptive alt text. Only use alt="" for purely decorative images.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
  },
  {
    id: 'low-contrast',
    wcagCriterion: '1.4.3',
    wcagTitle: 'Contrast (Minimum)',
    principle: 'Perceivable',
    severity: 'serious',
    message: 'Text does not have sufficient color contrast against its background (requires 4.5:1 ratio).',
    howToFix: 'Adjust the foreground or background color so that the contrast ratio is at least 4.5:1.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
  },
  {
    id: 'missing-label',
    wcagCriterion: '1.3.1',
    wcagTitle: 'Info and Relationships',
    principle: 'Perceivable',
    severity: 'critical',
    message: 'Form input is missing an associated label, aria-label, or aria-labelledby attribute.',
    howToFix: 'Associate a <label> element with the input, or add an aria-label attribute.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
  },
  {
    id: 'missing-lang',
    wcagCriterion: '3.1.1',
    wcagTitle: 'Language of Page',
    principle: 'Understandable',
    severity: 'serious',
    message: 'The <html> element is missing a lang attribute. Screen readers need this to choose the correct pronunciation.',
    howToFix: 'Add a lang attribute to the <html> element (e.g., lang="en").',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html',
  },
  {
    id: 'empty-lang',
    wcagCriterion: '3.1.1',
    wcagTitle: 'Language of Page',
    principle: 'Understandable',
    severity: 'serious',
    message: 'The <html> element has an empty lang attribute.',
    howToFix: 'Set the lang attribute to a valid language code (e.g., lang="en").',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html',
  },
  {
    id: 'non-descriptive-links',
    wcagCriterion: '2.4.4',
    wcagTitle: 'Link Purpose (In Context)',
    principle: 'Operable',
    severity: 'serious',
    message: 'Link text is generic and does not describe its destination or purpose.',
    howToFix: 'Replace generic link text with descriptive text that indicates the link destination.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
  },
  {
    id: 'missing-focus-style',
    wcagCriterion: '2.4.7',
    wcagTitle: 'Focus Visible',
    principle: 'Operable',
    severity: 'moderate',
    message: 'CSS contains outline:none or outline:0 which removes visible focus indicators.',
    howToFix: 'Remove outline:none/0 or provide a custom visible focus indicator.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html',
  },
  {
    id: 'missing-skip-link',
    wcagCriterion: '2.4.1',
    wcagTitle: 'Bypass Blocks',
    principle: 'Operable',
    severity: 'moderate',
    message: 'No skip navigation link found. Keyboard users cannot bypass repeated content blocks.',
    howToFix: 'Add a "Skip to main content" link as the first focusable element on the page.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html',
  },
  {
    id: 'small-font-size',
    wcagCriterion: '1.4.4',
    wcagTitle: 'Resize Text',
    principle: 'Perceivable',
    severity: 'moderate',
    message: 'Inline font-size is set below 12px, which can be difficult to read.',
    howToFix: 'Use a minimum font-size of 12px or use relative units (em, rem) for better scalability.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html',
  },
  {
    id: 'missing-form-fieldset',
    wcagCriterion: '1.3.1',
    wcagTitle: 'Info and Relationships',
    principle: 'Perceivable',
    severity: 'serious',
    message: 'Group of related radio/checkbox inputs is not wrapped in a <fieldset> with a <legend>.',
    howToFix: 'Wrap related radio/checkbox groups in a <fieldset> element with a <legend>.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
  },
  {
    id: 'video-no-captions',
    wcagCriterion: '1.2.2',
    wcagTitle: 'Captions (Prerecorded)',
    principle: 'Perceivable',
    severity: 'critical',
    message: 'Video element does not have a captions track.',
    howToFix: 'Add a <track kind="captions"> element inside the <video> tag.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/captions-prerecorded.html',
  },
  {
    id: 'audio-no-transcript',
    wcagCriterion: '1.2.1',
    wcagTitle: 'Audio-only and Video-only (Prerecorded)',
    principle: 'Perceivable',
    severity: 'moderate',
    message: 'Audio element found — ensure a text transcript is available.',
    howToFix: 'Provide a text transcript for the audio content.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html',
  },
  {
    id: 'missing-main-landmark',
    wcagCriterion: '1.3.6',
    wcagTitle: 'Identify Purpose',
    principle: 'Perceivable',
    severity: 'moderate',
    message: 'No <main> element or role="main" landmark found on the page.',
    howToFix: 'Wrap the primary content of the page in a <main> element.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/identify-purpose.html',
  },
  {
    id: 'missing-nav-landmark',
    wcagCriterion: '1.3.6',
    wcagTitle: 'Identify Purpose',
    principle: 'Perceivable',
    severity: 'minor',
    message: 'No <nav> element or role="navigation" landmark found on the page.',
    howToFix: 'Wrap navigation menus in a <nav> element.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/identify-purpose.html',
  },
  {
    id: 'empty-button',
    wcagCriterion: '4.1.2',
    wcagTitle: 'Name, Role, Value',
    principle: 'Robust',
    severity: 'critical',
    message: 'Button has no accessible name (no text content, aria-label, or aria-labelledby).',
    howToFix: 'Add text content to the button or provide an aria-label attribute.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
  },
  {
    id: 'missing-table-headers',
    wcagCriterion: '1.3.1',
    wcagTitle: 'Info and Relationships',
    principle: 'Perceivable',
    severity: 'serious',
    message: 'Data table does not contain any <th> header elements.',
    howToFix: 'Add <th> elements to identify column and/or row headers in the table.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
  },
  {
    id: 'positive-tabindex',
    wcagCriterion: '2.4.3',
    wcagTitle: 'Focus Order',
    principle: 'Operable',
    severity: 'moderate',
    message: 'Element has a positive tabindex value, which disrupts the natural tab order.',
    howToFix: 'Remove the positive tabindex or set it to 0. Use DOM order to control focus sequence.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html',
  },
  {
    id: 'duplicate-id',
    wcagCriterion: '4.1.1',
    wcagTitle: 'Parsing',
    principle: 'Robust',
    severity: 'serious',
    message: 'Multiple elements share the same id attribute, which causes accessibility tool failures.',
    howToFix: 'Ensure each id attribute value is unique within the page.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/parsing.html',
  },
  {
    id: 'missing-title',
    wcagCriterion: '2.4.2',
    wcagTitle: 'Page Titled',
    principle: 'Operable',
    severity: 'serious',
    message: 'The page is missing a <title> element or the title is empty.',
    howToFix: 'Add a descriptive <title> element in the <head> section.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/page-titled.html',
  },
  {
    id: 'autoplay-media',
    wcagCriterion: '1.4.2',
    wcagTitle: 'Audio Control',
    principle: 'Perceivable',
    severity: 'serious',
    message: 'Media element has autoplay enabled without being muted. This can be disruptive.',
    howToFix: 'Remove the autoplay attribute, or add the muted attribute.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html',
  },
  {
    id: 'meta-refresh',
    wcagCriterion: '2.2.1',
    wcagTitle: 'Timing Adjustable',
    principle: 'Operable',
    severity: 'serious',
    message: 'Page uses <meta http-equiv="refresh"> which can disorient users.',
    howToFix: 'Remove the meta refresh tag and use server-side redirects instead.',
    wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/timing-adjustable.html',
  },
];

// ── Helper: Get outer HTML string ───────────────────────────────────────
function getOuterHtml($: cheerio.CheerioAPI, el: Element): string {
  const html = $.html(el);
  // Truncate to 200 chars for readability
  return html.length > 200 ? html.substring(0, 200) + '...' : html;
}

// ── Helper: Build a CSS selector path ───────────────────────────────────
function buildSelector($: cheerio.CheerioAPI, el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;

  while (current && current.type === 'tag') {
    let selector = current.tagName.toLowerCase();
    const id = $(current).attr('id');
    if (id) {
      selector += `#${id}`;
      parts.unshift(selector);
      break;
    }
    const className = $(current).attr('class');
    if (className) {
      const classes = className.trim().split(/\s+/).slice(0, 2).join('.');
      selector += `.${classes}`;
    }
    parts.unshift(selector);
    const parentEl: cheerio.Cheerio<DomNode> = $(current).parent();
    current = parentEl.length ? (parentEl[0] as Element) : null;
  }

  return parts.join(' > ');
}

// ── Non-descriptive link text patterns ──────────────────────────────────
const VAGUE_LINK_TEXTS = ['click here', 'here', 'read more', 'more', 'link', 'this', 'learn more'];

// ── Rule checkers ───────────────────────────────────────────────────────

function checkMissingAlt($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  $('img:not([alt])').each((_, el) => {
    instances.push({
      element: getOuterHtml($, el),
      selector: buildSelector($, el),
    });
  });
  return instances;
}

function checkEmptyAltMeaningful($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  $('img[alt=""]').each((_, el) => {
    const $el = $(el);
    const insideLink = $el.closest('a').length > 0;
    const cls = ($el.attr('class') || '').toLowerCase();
    const isMeaningful = insideLink ||
      cls.includes('hero') || cls.includes('banner') ||
      cls.includes('logo') || cls.includes('photo') ||
      cls.includes('thumbnail') || cls.includes('content');
    if (isMeaningful) {
      instances.push({
        element: getOuterHtml($, el),
        selector: buildSelector($, el),
      });
    }
  });
  return instances;
}

function checkLowContrast($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    const bgMatch = style.match(/background-color\s*:\s*([^;]+)/i);
    if (colorMatch && bgMatch) {
      const fg = parseColor(colorMatch[1].trim());
      const bg = parseColor(bgMatch[1].trim());
      if (fg && bg) {
        const ratio = getContrastRatio(fg, bg);
        if (ratio < 4.5) {
          instances.push({
            element: getOuterHtml($, el),
            selector: buildSelector($, el),
          });
        }
      }
    }
  });
  return instances;
}

function checkMissingLabel($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  const excludeTypes = ['hidden', 'submit', 'button', 'reset', 'image'];
  $('input, select, textarea').each((_, el) => {
    const $el = $(el);
    const type = ($el.attr('type') || 'text').toLowerCase();
    if (el.tagName.toLowerCase() === 'input' && excludeTypes.includes(type)) return;

    const id = $el.attr('id');
    const hasLabel = (id && $(`label[for="${id}"]`).length > 0) ||
      $el.attr('aria-label') ||
      $el.attr('aria-labelledby') ||
      $el.attr('title') ||
      $el.closest('label').length > 0;

    if (!hasLabel) {
      instances.push({
        element: getOuterHtml($, el),
        selector: buildSelector($, el),
      });
    }
  });
  return instances;
}

function checkMissingLang($: cheerio.CheerioAPI): RawIssueInstance[] {
  const html = $('html');
  if (html.length && !html.attr('lang')) {
    return [{ element: '<html>', selector: 'html' }];
  }
  return [];
}

function checkEmptyLang($: cheerio.CheerioAPI): RawIssueInstance[] {
  const html = $('html');
  const lang = html.attr('lang');
  if (html.length && lang !== undefined && lang.trim() === '') {
    return [{ element: '<html lang="">', selector: 'html' }];
  }
  return [];
}

function checkNonDescriptiveLinks($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  $('a[href]').each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim().toLowerCase();
    if (VAGUE_LINK_TEXTS.includes(text) && !$el.attr('aria-label')) {
      instances.push({
        element: getOuterHtml($, el),
        selector: buildSelector($, el),
      });
    }
  });
  return instances;
}

function checkMissingFocusStyle($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  // Check inline styles
  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || '';
    if (/outline\s*:\s*(none|0)\b/i.test(style)) {
      instances.push({
        element: getOuterHtml($, el),
        selector: buildSelector($, el),
      });
    }
  });
  // Check <style> blocks
  $('style').each((_, el) => {
    const cssText = $(el).text();
    if (/outline\s*:\s*(none|0)\b/i.test(cssText)) {
      instances.push({
        element: '<style>...outline: none...</style>',
        selector: 'style',
      });
    }
  });
  return instances;
}

function checkMissingSkipLink($: cheerio.CheerioAPI): RawIssueInstance[] {
  const skipLink = $('a[href="#main"], a[href="#content"], a[href="#maincontent"], .skip-link, .skip-nav, [class*="skip"]');
  if (skipLink.length === 0) {
    return [{ element: '<body>', selector: 'body' }];
  }
  return [];
}

function checkSmallFontSize($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const match = style.match(/font-size\s*:\s*(\d+(?:\.\d+)?)\s*px/i);
    if (match) {
      const size = parseFloat(match[1]);
      if (size > 0 && size < 12) {
        instances.push({
          element: getOuterHtml($, el),
          selector: buildSelector($, el),
        });
      }
    }
  });
  return instances;
}

function checkMissingFormFieldset($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  const radioGroups = new Map<string, Element[]>();

  $('input[type="radio"], input[type="checkbox"]').each((_, el) => {
    const name = $(el).attr('name') || 'unnamed';
    if (!radioGroups.has(name)) {
      radioGroups.set(name, []);
    }
    radioGroups.get(name)!.push(el);
  });

  radioGroups.forEach((elements, name) => {
    if (elements.length > 1) {
      const firstEl = elements[0];
      const inFieldset = $(firstEl).closest('fieldset').length > 0;
      if (!inFieldset) {
        instances.push({
          element: `Group of ${elements.length} inputs with name="${name}"`,
          selector: buildSelector($, firstEl),
        });
      }
    }
  });

  return instances;
}

function checkVideoNoCaptions($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  $('video').each((_, el) => {
    const hasCaptions = $(el).find('track[kind="captions"], track[kind="subtitles"]').length > 0;
    if (!hasCaptions) {
      instances.push({
        element: getOuterHtml($, el),
        selector: buildSelector($, el),
      });
    }
  });
  return instances;
}

function checkAudioNoTranscript($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  $('audio').each((_, el) => {
    instances.push({
      element: getOuterHtml($, el),
      selector: buildSelector($, el),
    });
  });
  return instances;
}

function checkMissingMainLandmark($: cheerio.CheerioAPI): RawIssueInstance[] {
  const hasMain = $('main, [role="main"]').length > 0;
  if (!hasMain) {
    return [{ element: '<body>', selector: 'body' }];
  }
  return [];
}

function checkMissingNavLandmark($: cheerio.CheerioAPI): RawIssueInstance[] {
  const hasNav = $('nav, [role="navigation"]').length > 0;
  if (!hasNav) {
    return [{ element: '<body>', selector: 'body' }];
  }
  return [];
}

function checkEmptyButton($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  $('button').each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    const ariaLabel = $el.attr('aria-label');
    const ariaLabelledby = $el.attr('aria-labelledby');
    const title = $el.attr('title');
    const hasImg = $el.find('img[alt], svg[aria-label]').length > 0;
    if (!text && !ariaLabel && !ariaLabelledby && !title && !hasImg) {
      instances.push({
        element: getOuterHtml($, el),
        selector: buildSelector($, el),
      });
    }
  });
  return instances;
}

function checkMissingTableHeaders($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  $('table').each((_, el) => {
    const hasTh = $(el).find('th').length > 0;
    const hasRoleHeader = $(el).find('[role="columnheader"], [role="rowheader"]').length > 0;
    if (!hasTh && !hasRoleHeader) {
      instances.push({
        element: getOuterHtml($, el),
        selector: buildSelector($, el),
      });
    }
  });
  return instances;
}

function checkPositiveTabindex($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  $('[tabindex]').each((_, el) => {
    const tabindex = parseInt($(el).attr('tabindex') || '0', 10);
    if (tabindex > 0) {
      instances.push({
        element: getOuterHtml($, el),
        selector: buildSelector($, el),
      });
    }
  });
  return instances;
}

function checkDuplicateId($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  const idCounts = new Map<string, { count: number; elements: Element[] }>();

  $('[id]').each((_, el) => {
    const id = $(el).attr('id') || '';
    if (!id) return;
    if (!idCounts.has(id)) {
      idCounts.set(id, { count: 0, elements: [] });
    }
    const entry = idCounts.get(id)!;
    entry.count++;
    entry.elements.push(el);
  });

  idCounts.forEach((data, id) => {
    if (data.count > 1) {
      data.elements.forEach((el) => {
        instances.push({
          element: getOuterHtml($, el),
          selector: `[id="${id}"]`,
        });
      });
    }
  });
  return instances;
}

function checkMissingTitle($: cheerio.CheerioAPI): RawIssueInstance[] {
  const title = $('title').first();
  if (!title.length || !title.text().trim()) {
    return [{ element: '<head>...</head>', selector: 'head' }];
  }
  return [];
}

function checkAutoplayMedia($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  $('video[autoplay], audio[autoplay]').each((_, el) => {
    const isMuted = $(el).attr('muted') !== undefined;
    if (!isMuted) {
      instances.push({
        element: getOuterHtml($, el),
        selector: buildSelector($, el),
      });
    }
  });
  return instances;
}

function checkMetaRefresh($: cheerio.CheerioAPI): RawIssueInstance[] {
  const instances: RawIssueInstance[] = [];
  $('meta[http-equiv="refresh"]').each((_, el) => {
    instances.push({
      element: getOuterHtml($, el),
      selector: buildSelector($, el),
    });
  });
  return instances;
}

// ── Checker map ─────────────────────────────────────────────────────────
const CHECKERS: Record<string, ($: cheerio.CheerioAPI) => RawIssueInstance[]> = {
  'missing-alt': checkMissingAlt,
  'empty-alt-meaningful': checkEmptyAltMeaningful,
  'low-contrast': checkLowContrast,
  'missing-label': checkMissingLabel,
  'missing-lang': checkMissingLang,
  'empty-lang': checkEmptyLang,
  'non-descriptive-links': checkNonDescriptiveLinks,
  'missing-focus-style': checkMissingFocusStyle,
  'missing-skip-link': checkMissingSkipLink,
  'small-font-size': checkSmallFontSize,
  'missing-form-fieldset': checkMissingFormFieldset,
  'video-no-captions': checkVideoNoCaptions,
  'audio-no-transcript': checkAudioNoTranscript,
  'missing-main-landmark': checkMissingMainLandmark,
  'missing-nav-landmark': checkMissingNavLandmark,
  'empty-button': checkEmptyButton,
  'missing-table-headers': checkMissingTableHeaders,
  'positive-tabindex': checkPositiveTabindex,
  'duplicate-id': checkDuplicateId,
  'missing-title': checkMissingTitle,
  'autoplay-media': checkAutoplayMedia,
  'meta-refresh': checkMetaRefresh,
};

// ── Main audit function ─────────────────────────────────────────────────
export function runAudit(html: string): Issue[] {
  const $ = cheerio.load(html);
  const issues: Issue[] = [];

  for (const rule of RULES) {
    const checker = CHECKERS[rule.id];
    if (!checker) continue;

    const rawInstances = checker($);
    if (rawInstances.length === 0) continue;

    // Limit to 5 instances
    const limitedInstances = rawInstances.slice(0, 5);

    const instances: IssueInstance[] = limitedInstances.map((raw) => ({
      element: raw.element,
      selector: raw.selector,
      fixCode: getFixSuggestion(rule.id, raw.element),
    }));

    issues.push({
      id: rule.id,
      wcagCriterion: rule.wcagCriterion,
      wcagTitle: rule.wcagTitle,
      principle: rule.principle,
      severity: rule.severity,
      count: rawInstances.length,
      instances,
      message: rule.message,
      howToFix: rule.howToFix,
      wcagUrl: rule.wcagUrl,
    });
  }

  return issues;
}

// ── Total number of rules for scoring ───────────────────────────────────
export const TOTAL_RULES = RULES.length;
