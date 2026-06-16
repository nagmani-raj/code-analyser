import type { Language } from '@dsa-analyzer/shared';
import { normalizePlatformLanguage } from '@dsa-analyzer/analyzer';

// ─────────────────────────────────────────────
// HackerRank Code Extractor
// ─────────────────────────────────────────────

/**
 * Extract code from HackerRank's CodeMirror editor.
 */
export function extractHackerRankCode(): { code: string; language: Language } | null {
  // Primary: CodeMirror editor
  const cmEditor = document.querySelector('.CodeMirror-code');
  if (cmEditor) {
    const lines = cmEditor.querySelectorAll('.CodeMirror-line');
    const code = Array.from(lines)
      .map(line => (line as HTMLElement).innerText)
      .join('\n');
    if (code.trim().length > 10) {
      return { code: code.trim(), language: extractHackerRankLanguage() };
    }
  }

  // Fallback: Monaco
  const monacoLines = document.querySelectorAll('.view-lines .view-line');
  if (monacoLines.length > 0) {
    const code = Array.from(monacoLines)
      .map(line => (line as HTMLElement).innerText)
      .join('\n');
    if (code.trim().length > 10) {
      return { code: code.trim(), language: extractHackerRankLanguage() };
    }
  }

  return null;
}

function extractHackerRankLanguage(): Language {
  const selectors = [
    '.Select-value-label',
    '[class*="language-select"] .Select-value-label',
    '.language-select .Select-value',
    '[data-key="language"] .Select-value-label',
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent) {
      const lang = normalizePlatformLanguage(el.textContent.trim(), 'hackerrank');
      if (lang !== 'unknown') return lang;
    }
  }

  return 'unknown';
}

export function observeHackerRankChanges(callback: () => void): MutationObserver {
  const observer = new MutationObserver(() => callback());
  const container = document.querySelector('.CodeMirror') ?? document.body;
  observer.observe(container, { childList: true, subtree: true, characterData: true });
  return observer;
}
