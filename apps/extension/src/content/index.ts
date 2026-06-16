import type { Platform, CodeDetectedPayload, ExtensionMessage } from '@dsa-analyzer/shared';
import { PLATFORM_HOSTNAMES, DEBOUNCE_MS, MIN_CODE_LENGTH } from '@dsa-analyzer/shared';

import { extractLeetCodeCode, observeLeetCodeChanges } from './extractors/leetcode';
import { extractGFGCode, observeGFGChanges } from './extractors/geeksforgeeks';
import { extractHackerRankCode, observeHackerRankChanges } from './extractors/hackerrank';
import { extractCodeforcesCode, observeCodeforcesChanges } from './extractors/codeforces';

// ─────────────────────────────────────────────
// Platform Detection
// ─────────────────────────────────────────────

function detectPlatform(): Platform {
  const hostname = window.location.hostname;
  return PLATFORM_HOSTNAMES[hostname] ?? 'unknown';
}

// ─────────────────────────────────────────────
// Code Extraction Router
// ─────────────────────────────────────────────

function extractCode(platform: Platform) {
  switch (platform) {
    case 'leetcode':
      return extractLeetCodeCode();
    case 'geeksforgeeks':
      return extractGFGCode();
    case 'hackerrank':
      return extractHackerRankCode();
    case 'codeforces':
      return extractCodeforcesCode();
    default:
      return null;
  }
}

function setupObserver(platform: Platform, callback: () => void): MutationObserver | null {
  switch (platform) {
    case 'leetcode':
      return observeLeetCodeChanges(callback);
    case 'geeksforgeeks':
      return observeGFGChanges(callback);
    case 'hackerrank':
      return observeHackerRankChanges(callback);
    case 'codeforces':
      return observeCodeforcesChanges(callback);
    default:
      return null;
  }
}

// ─────────────────────────────────────────────
// Debounce utility
// ─────────────────────────────────────────────

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

// ─────────────────────────────────────────────
// Main Content Script Logic
// ─────────────────────────────────────────────

let lastCode = '';
let observer: MutationObserver | null = null;
const platform = detectPlatform();

if (platform === 'unknown') {
  console.log('[DSA Analyzer] Not a supported coding platform — skipping');
} else {
  console.log(`[DSA Analyzer] Active on platform: ${platform}`);
  init();
}

function sendCodeToBackground(payload: CodeDetectedPayload) {
  const message: ExtensionMessage<CodeDetectedPayload> = {
    type: 'CODE_DETECTED',
    payload,
  };
  chrome.runtime.sendMessage(message).catch(err => {
    // Extension might not be listening yet — silently ignore
    if (!err.message?.includes('Receiving end does not exist')) {
      console.warn('[DSA Analyzer] Could not send message:', err);
    }
  });
}

const debouncedAnalyze = debounce(() => {
  const result = extractCode(platform);
  if (!result) return;

  const { code, language } = result;
  if (code.length < MIN_CODE_LENGTH) return;
  if (code === lastCode) return; // No change

  lastCode = code;
  sendCodeToBackground({
    code,
    language,
    platform,
    url: window.location.href,
  });
}, DEBOUNCE_MS);

function init() {
  // Initial analysis after page load
  setTimeout(() => {
    debouncedAnalyze();
  }, 2000);

  // Observe code changes
  observer = setupObserver(platform, debouncedAnalyze);

  // Listen for submit button clicks
  document.addEventListener(
    'click',
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isSubmit =
        target.matches('[data-e2e-locator="console-submit-button"]') ||
        target.matches('button[class*="submit"]') ||
        target.closest('button')?.textContent?.toLowerCase().includes('submit');

      if (isSubmit) {
        // Immediate analysis on submit
        setTimeout(debouncedAnalyze, 100);
      }
    },
    true
  );

  // Listen for language change events
  document.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLElement;
    if (
      target.matches('select[name="language"]') ||
      target.matches('#languageId') ||
      target.matches('[class*="language"]')
    ) {
      setTimeout(debouncedAnalyze, 300);
    }
  });

  // Listen for messages from popup (manual re-analyze request)
  chrome.runtime.onMessage.addListener((message: ExtensionMessage<unknown>) => {
    if (message.type === 'ANALYZE_REQUEST') {
      lastCode = ''; // Force re-analyze
      debouncedAnalyze();
    }
  });
}
