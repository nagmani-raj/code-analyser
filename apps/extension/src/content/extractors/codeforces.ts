import type { Language } from '@dsa-analyzer/shared';
import { normalizePlatformLanguage } from '@dsa-analyzer/analyzer';

// ─────────────────────────────────────────────
// Codeforces Code Extractor
// ─────────────────────────────────────────────

/**
 * Extract code from Codeforces.
 * Codeforces has a plain textarea for code submission.
 */
export function extractCodeforcesCode(): { code: string; language: Language } | null {
  // Primary: submission textarea
  const textarea = document.querySelector<HTMLTextAreaElement>(
    'textarea#sourceCodeTextarea, textarea[name="source"], #editor textarea'
  );
  if (textarea && textarea.value.trim().length > 10) {
    return { code: textarea.value.trim(), language: extractCodeforcesLanguage() };
  }

  // Fallback: Ace editor (used in some Codeforces pages)
  const aceLines = document.querySelectorAll('.ace_content .ace_line');
  if (aceLines.length > 0) {
    const code = Array.from(aceLines)
      .map(line => (line as HTMLElement).innerText)
      .join('\n');
    if (code.trim().length > 10) {
      return { code: code.trim(), language: extractCodeforcesLanguage() };
    }
  }

  // Fallback: CodeMirror
  const cmEditor = document.querySelector('.CodeMirror-code');
  if (cmEditor) {
    const lines = cmEditor.querySelectorAll('.CodeMirror-line');
    const code = Array.from(lines)
      .map(line => (line as HTMLElement).innerText)
      .join('\n');
    if (code.trim().length > 10) {
      return { code: code.trim(), language: extractCodeforcesLanguage() };
    }
  }

  return null;
}

function extractCodeforcesLanguage(): Language {
  const selectors = [
    '#languageId option:checked',
    'select[name="programTypeId"] option:checked',
    '.lang-chooser option:checked',
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent) {
      const lang = normalizePlatformLanguage(el.textContent.trim(), 'codeforces');
      if (lang !== 'unknown') return lang;
    }
  }

  return 'unknown';
}

export function observeCodeforcesChanges(callback: () => void): MutationObserver {
  const observer = new MutationObserver(() => callback());
  const container =
    document.querySelector('textarea#sourceCodeTextarea') ??
    document.querySelector('.ace_editor') ??
    document.body;
  observer.observe(container, { childList: true, subtree: true, characterData: true });
  return observer;
}
