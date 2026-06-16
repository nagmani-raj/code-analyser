import type { Language, Approach, TimeComplexity, SpaceComplexity, Platform } from './types';

// ─────────────────────────────────────────────
// Supported Languages
// ─────────────────────────────────────────────

export const SUPPORTED_LANGUAGES: Language[] = [
  'cpp',
  'java',
  'python',
  'javascript',
  'typescript',
  'go',
];

export const LANGUAGE_DISPLAY_NAMES: Record<Language, string> = {
  cpp: 'C++',
  java: 'Java',
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  go: 'Go',
  unknown: 'Unknown',
};

// ─────────────────────────────────────────────
// Platform → Language label mapping
// ─────────────────────────────────────────────

export const LEETCODE_LANGUAGE_MAP: Record<string, Language> = {
  'C++': 'cpp',
  Java: 'java',
  Python: 'python',
  'Python3': 'python',
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Go: 'go',
  Golang: 'go',
};

export const GFG_LANGUAGE_MAP: Record<string, Language> = {
  'C++': 'cpp',
  Java: 'java',
  Python3: 'python',
  Python: 'python',
  JavaScript: 'javascript',
};

export const HACKERRANK_LANGUAGE_MAP: Record<string, Language> = {
  cpp: 'cpp',
  cpp14: 'cpp',
  cpp17: 'cpp',
  java: 'java',
  java8: 'java',
  java15: 'java',
  python3: 'python',
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  go: 'go',
};

export const CODEFORCES_LANGUAGE_MAP: Record<string, Language> = {
  'GNU G++17 7.3.0': 'cpp',
  'GNU G++20 11.2.0': 'cpp',
  'GNU G++14 6.4.0': 'cpp',
  'Java 11': 'java',
  'Java 17': 'java',
  'PyPy 3': 'python',
  'Python 3': 'python',
  'Python 3.8.12': 'python',
  'Node.js 12.16.3': 'javascript',
  'TypeScript 4.5': 'typescript',
  'Go 1.19.1': 'go',
};

// ─────────────────────────────────────────────
// Approaches
// ─────────────────────────────────────────────

export const ALL_APPROACHES: Approach[] = [
  'Brute Force',
  'Two Pointer',
  'Sliding Window',
  'Hashing',
  'Binary Search',
  'Dynamic Programming',
  'Greedy',
  'DFS',
  'BFS',
  'Backtracking',
  'Recursion',
  'Stack',
  'Queue',
  'Heap / Priority Queue',
  'Graph',
  'Tree',
  'Trie',
  'Segment Tree',
  'Union Find (DSU)',
  'Bit Manipulation',
  'Divide and Conquer',
  'Unknown',
];

// ─────────────────────────────────────────────
// Complexity Classes
// ─────────────────────────────────────────────

export const TIME_COMPLEXITIES: TimeComplexity[] = [
  'O(1)',
  'O(log n)',
  'O(n)',
  'O(n log n)',
  'O(n²)',
  'O(n³)',
  'O(2^n)',
  'O(n!)',
  'Unknown',
];

export const SPACE_COMPLEXITIES: SpaceComplexity[] = [
  'O(1)',
  'O(log n)',
  'O(n)',
  'O(n²)',
  'Unknown',
];

// ─────────────────────────────────────────────
// Platforms
// ─────────────────────────────────────────────

export const PLATFORM_HOSTNAMES: Record<string, Platform> = {
  'leetcode.com': 'leetcode',
  'www.leetcode.com': 'leetcode',
  'geeksforgeeks.org': 'geeksforgeeks',
  'www.geeksforgeeks.org': 'geeksforgeeks',
  'practice.geeksforgeeks.org': 'geeksforgeeks',
  'hackerrank.com': 'hackerrank',
  'www.hackerrank.com': 'hackerrank',
  'codeforces.com': 'codeforces',
  'www.codeforces.com': 'codeforces',
};

export const PLATFORM_DISPLAY_NAMES: Record<Platform, string> = {
  leetcode: 'LeetCode',
  geeksforgeeks: 'GeeksforGeeks',
  hackerrank: 'HackerRank',
  codeforces: 'Codeforces',
  unknown: 'Unknown',
};

// ─────────────────────────────────────────────
// Backend Config
// ─────────────────────────────────────────────

export const DEFAULT_BACKEND_URL = 'http://localhost:3001';
export const ANALYZE_ENDPOINT = '/analyze';
export const HISTORY_ENDPOINT = '/history';

// ─────────────────────────────────────────────
// Analysis Config
// ─────────────────────────────────────────────

export const MAX_HISTORY_ITEMS = 50;
export const DEBOUNCE_MS = 1500; // debounce code-change re-analysis
export const MIN_CODE_LENGTH = 20; // ignore tiny snippets
