import type { Language } from '@dsa-analyzer/shared';
import { normalizePlatformLanguage } from '@dsa-analyzer/analyzer';

// ─────────────────────────────────────────────
// GeeksforGeeks Code Extractor
// ─────────────────────────────────────────────

/**
 * Extract code from GeeksforGeeks CodeMirror editor.
 */
export function extractGFGCode(): { code: string; language: Language } | null {
  // CodeMirror editor (primary)
  const cmEditor = document.querySelector('.CodeMirror-code');
  if (cmEditor) {
    const lines = cmEditor.querySelectorAll('.CodeMirror-line');
    const code = Array.from(lines)
      .map(line => (line as HTMLElement).innerText)
      .join('\n');
    if (code.trim().length > 10) {
      return { code: code.trim(), language: extractGFGLanguage() };
    }
  }

  // Ace editor (GFG sometimes uses Ace)
  const aceEditor = document.querySelector('.ace_content');
  if (aceEditor) {
    const lines = aceEditor.querySelectorAll('.ace_line');
    const code = Array.from(lines)
      .map(line => (line as HTMLElement).innerText)
      .join('\n');
    if (code.trim().length > 10) {
      return { code: code.trim(), language: extractGFGLanguage() };
    }
  }

  // Textarea fallback
  const textarea = document.querySelector<HTMLTextAreaElement>('#code, textarea[name="code"]');
  if (textarea && textarea.value.trim().length > 10) {
    return { code: textarea.value.trim(), language: extractGFGLanguage() };
  }

  return null;
}

function extractGFGLanguage(): Language {
  // Language dropdown
  const selectors = [
    '#languageId option:checked',
    'select[name="language"] option:checked',
    '.lang-select',
    '[class*="language"] select option:checked',
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent) {
      const lang = normalizePlatformLanguage(el.textContent.trim(), 'geeksforgeeks');
      if (lang !== 'unknown') return lang;
    }
  }

  return 'unknown';
}

export function observeGFGChanges(callback: () => void): MutationObserver {
  const observer = new MutationObserver(() => callback());
  const container = document.querySelector('.CodeMirror') ?? document.querySelector('.ace_editor') ?? document.body;
  observer.observe(container, { childList: true, subtree: true, characterData: true });
  return observer;
}
