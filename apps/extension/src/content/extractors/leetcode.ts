import type { Language } from '@dsa-analyzer/shared';
import { normalizePlatformLanguage } from '@dsa-analyzer/analyzer';

// ─────────────────────────────────────────────
// LeetCode Code Extractor
// ─────────────────────────────────────────────

/**
 * Extract code from LeetCode's Monaco editor or CodeMirror editor.
 * LeetCode uses Monaco editor (same as VSCode).
 */
export function extractLeetCodeCode(): { code: string; language: Language } | null {
  // Monaco editor lines (primary approach)
  const monacoLines = document.querySelectorAll('.view-lines .view-line');
  if (monacoLines.length > 0) {
    const code = Array.from(monacoLines)
      .map(line => (line as HTMLElement).innerText)
      .join('\n');

    const lang = extractLeetCodeLanguage();
    if (code.trim().length > 10) {
      return { code: code.trim(), language: lang };
    }
  }

  // Fallback: CodeMirror editor (older LeetCode)
  const cmCode = document.querySelector('.CodeMirror-code');
  if (cmCode) {
    const lines = cmCode.querySelectorAll('.CodeMirror-line');
    const code = Array.from(lines)
      .map(line => (line as HTMLElement).innerText)
      .join('\n');
    if (code.trim().length > 10) {
      return { code: code.trim(), language: extractLeetCodeLanguage() };
    }
  }

  // Fallback: textarea
  const textarea = document.querySelector<HTMLTextAreaElement>('textarea.inputarea');
  if (textarea && textarea.value.trim().length > 10) {
    return { code: textarea.value.trim(), language: extractLeetCodeLanguage() };
  }

  return null;
}

function extractLeetCodeLanguage(): Language {
  // Language selector button
  const langButton = document.querySelector('[data-cy="lang-select"]');
  if (langButton) {
    return normalizePlatformLanguage(langButton.textContent?.trim() ?? '', 'leetcode');
  }

  // Alternative: look for language in various selectors
  const selectors = [
    '.ant-select-selection-item',
    '[class*="languageSelector"] button',
    'button[class*="lang"]',
    '.select-lang button',
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent) {
      const lang = normalizePlatformLanguage(el.textContent.trim(), 'leetcode');
      if (lang !== 'unknown') return lang;
    }
  }

  return 'unknown';
}

/**
 * Set up a MutationObserver that calls the callback when LeetCode code changes.
 */
export function observeLeetCodeChanges(callback: () => void): MutationObserver {
  const observer = new MutationObserver(() => callback());
  const container = document.querySelector('.monaco-editor') ?? document.querySelector('.CodeMirror') ?? document.body;
  observer.observe(container, { childList: true, subtree: true, characterData: true });
  return observer;
}
