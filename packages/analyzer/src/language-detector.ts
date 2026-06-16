import type { Language } from '@dsa-analyzer/shared';
import {
  LEETCODE_LANGUAGE_MAP,
  GFG_LANGUAGE_MAP,
  HACKERRANK_LANGUAGE_MAP,
  CODEFORCES_LANGUAGE_MAP,
} from '@dsa-analyzer/shared';

// ─────────────────────────────────────────────
// Language Detection from code content
// ─────────────────────────────────────────────

interface LanguageSignature {
  language: Language;
  patterns: RegExp[];
  weight: number;
}

const LANGUAGE_SIGNATURES: LanguageSignature[] = [
  {
    language: 'cpp',
    weight: 10,
    patterns: [
      /#include\s*[<"]/,
      /\busing namespace std\b/,
      /\bvector\s*</,
      /\bunordered_map\s*</,
      /\bpriority_queue\s*</,
      /\bcout\s*<</,
      /\bcin\s*>>/,
      /\bint\s+main\s*\(/,
      /\bauto\s+\w+\s*=/,
    ],
  },
  {
    language: 'java',
    weight: 9,
    patterns: [
      /\bimport java\./,
      /\bpublic\s+class\s+\w+/,
      /\bSystem\.out\.print/,
      /\bArrayList\s*<\s*\w/,
      /\bHashMap\s*<\s*\w/,
      /\bLinkedList\s*<\s*\w/,
      /\bPriorityQueue\s*<\s*\w/,
      /\bpublic static void main/,
      /\bScanner\s+\w+\s*=/,
    ],
  },
  {
    language: 'python',
    weight: 9,
    patterns: [
      /\bdef\s+\w+\s*\(/,
      /\bimport\s+\w+/,
      /\bfrom\s+\w+\s+import/,
      /:\s*\n\s+/,
      /\bprint\s*\(/,
      /\brange\s*\(/,
      /\blen\s*\(/,
      /\bself\b/,
      /\bNone\b/,
      /\bTrue\b/,
      /\bFalse\b/,
    ],
  },
  {
    language: 'typescript',
    weight: 10,
    patterns: [
      /:\s*(string|number|boolean|void|any|never)\b/,
      /\binterface\s+\w+/,
      /\btype\s+\w+\s*=/,
      /\benum\s+\w+/,
      /\bReadonly\s*</,
      /\bPartial\s*</,
      /\bRecord\s*</,
      /\bimport\s+type\b/,
    ],
  },
  {
    language: 'javascript',
    weight: 7,
    patterns: [
      /\bconst\s+\w+\s*=/,
      /\blet\s+\w+\s*=/,
      /\bvar\s+\w+\s*=/,
      /\bfunction\s+\w+\s*\(/,
      /=>\s*\{/,
      /\bconsole\.log\s*\(/,
      /\bMap\s*\(\)/,
      /\bSet\s*\(\)/,
      /\bdocument\./,
    ],
  },
  {
    language: 'go',
    weight: 10,
    patterns: [
      /\bpackage\s+\w+/,
      /\bfunc\s+\w+\s*\(/,
      /\bfmt\.Print/,
      /\bfmt\.Scan/,
      /\bvar\s+\w+\s+\w+\b/,
      /\bmake\s*\(/,
      /\bgo\s+func\b/,
      /\bchan\s+\w+/,
      /:=\s/,
    ],
  },
];

/**
 * Detect language from raw code content using heuristic pattern matching.
 */
export function detectLanguageFromCode(code: string): Language {
  const scores: Partial<Record<Language, number>> = {};

  for (const sig of LANGUAGE_SIGNATURES) {
    let score = 0;
    for (const pattern of sig.patterns) {
      if (pattern.test(code)) score += sig.weight;
    }
    if (score > 0) scores[sig.language] = (scores[sig.language] ?? 0) + score;
  }

  let best: Language = 'unknown';
  let bestScore = 0;
  for (const [lang, score] of Object.entries(scores) as [Language, number][]) {
    if (score > bestScore) {
      bestScore = score;
      best = lang;
    }
  }

  return best;
}

/**
 * Normalize platform language label string → internal Language type.
 */
export function normalizePlatformLanguage(
  label: string,
  platform: 'leetcode' | 'geeksforgeeks' | 'hackerrank' | 'codeforces' | 'unknown'
): Language {
  const maps = {
    leetcode: LEETCODE_LANGUAGE_MAP,
    geeksforgeeks: GFG_LANGUAGE_MAP,
    hackerrank: HACKERRANK_LANGUAGE_MAP,
    codeforces: CODEFORCES_LANGUAGE_MAP,
    unknown: {} as Record<string, Language>,
  };

  const map = maps[platform] ?? {};
  // Exact match
  if (map[label]) return map[label];
  // Case-insensitive fallback
  const lower = label.toLowerCase();
  for (const [key, val] of Object.entries(map)) {
    if (key.toLowerCase() === lower) return val;
  }
  return 'unknown';
}
