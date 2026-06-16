import type { Language } from '@dsa-analyzer/shared';

// ─────────────────────────────────────────────
// AST-like Code Representation
// (lightweight heuristic AST without WASM tree-sitter)
// For browser/extension compatibility without native bindings
// ─────────────────────────────────────────────

export interface CodeFeatures {
  // Loop analysis
  loopDepth: number;          // max nesting depth of loops
  loopCount: number;          // total loop count
  hasNestedLoop: boolean;
  hasTripleNestedLoop: boolean;

  // Recursion
  hasRecursion: boolean;
  hasExponentialRecursion: boolean; // recursion with 2+ recursive calls & no memo

  // Data structures detected
  dataStructures: Set<string>;

  // Algorithm patterns
  hasBinarySearchPattern: boolean;
  hasTwoPointerPattern: boolean;
  hasSlidingWindowPattern: boolean;
  hasMemoization: boolean;
  hasDPTable: boolean;
  hasStackUsage: boolean;
  hasQueueUsage: boolean;
  hasHeapUsage: boolean;
  hasTrieUsage: boolean;
  hasUnionFind: boolean;
  hasSegmentTree: boolean;
  hasBitManipulation: boolean;
  hasBFS: boolean;
  hasDFS: boolean;
  hasBacktracking: boolean;
  hasGreedy: boolean;
  hasDivideAndConquer: boolean;
  hasGraphAlgorithm: boolean;
  hasTreeTraversal: boolean;
  hasSorting: boolean;

  // Hashing
  hasHashMap: boolean;
  hasHashSet: boolean;

  // Misc
  functionCount: number;
  hasEarlyReturn: boolean;
  maxArrayDimensions: number;
  variableCount: number;
}

// ─────────────────────────────────────────────
// Language-specific patterns
// ─────────────────────────────────────────────

interface LanguagePatterns {
  loop: RegExp[];
  recursionCall: RegExp;
  hashMap: RegExp[];
  hashSet: RegExp[];
  binarySearch: RegExp[];
  twoPointer: RegExp[];
  slidingWindow: RegExp[];
  memoization: RegExp[];
  dpTable: RegExp[];
  stack: RegExp[];
  queue: RegExp[];
  heap: RegExp[];
  trie: RegExp[];
  unionFind: RegExp[];
  segmentTree: RegExp[];
  bitOp: RegExp[];
  bfs: RegExp[];
  dfs: RegExp[];
  backtrack: RegExp[];
  greedy: RegExp[];
  divideConquer: RegExp[];
  graph: RegExp[];
  tree: RegExp[];
  sort: RegExp[];
}

const PATTERNS: Record<string, LanguagePatterns> = {
  cpp: {
    loop: [/\bfor\s*\(/, /\bwhile\s*\(/, /\bdo\s*\{/],
    recursionCall: /\b(\w+)\s*\([^)]*\)\s*[;,)]/,
    hashMap: [/\bunordered_map\s*</, /\bmap\s*</, /\bstd::map\b/, /\bstd::unordered_map\b/],
    hashSet: [/\bunordered_set\s*</, /\bset\s*</, /\bstd::set\b/],
    binarySearch: [/\bbinary_search\b/, /\blower_bound\b/, /\bupper_bound\b/, /\bmid\s*=\s*\(?\s*(lo|left|l)\s*\+\s*(hi|right|r)\s*\)?/, /\bmid\s*=\s*(lo|left|l)\s*\+\s*\(\s*(hi|right|r)\s*-\s*(lo|left|l)\s*\)\s*\/\s*2/],
    twoPointer: [/\b(left|l|lo)\s*=\s*0/, /\b(right|r|hi)\s*=\s*(n|nums\.size|arr\.size)/],
    slidingWindow: [/\bwindow\b/, /\bshrink\b/, /\bexpand\b/, /\(j\s*-\s*i\)/, /\bmp\[s\[(?:left|right)\]\]/, /\bcount\[s\[(?:left|right)\]\]/, /while\s*\(mp\|freq\|count/],
    memoization: [/\bmemo\[/, /\bdp\[.*\]\s*!=\s*-1/, /\bcache\[/, /\bmemo\.count\(/],
    dpTable: [/\bvector<vector<int>>\s+dp/, /\bint\s+dp\[/, /\bdp\[i\]\[j\]/],
    stack: [/\bstack\s*</, /\.push\s*\(/, /\.top\s*\(/, /\.pop\s*\(/],
    queue: [/\bqueue\s*</, /\bdeque\s*</, /\.front\s*\(/, /\.push\s*\(/, /\.pop\s*\(/],
    heap: [/\bpriority_queue\s*</, /make_heap\b/, /push_heap\b/],
    trie: [/\bTrie\b/, /\btrie\b/, /\bchildren\s*\[26\]/, /\bchildren\s*\[/, /\bprefix\b/],
    unionFind: [/\bparent\s*\[/, /\bfind\s*\(/, /\b(?:union|union_sets|unionSets|merge)\s*\(/, /\brank\s*\[/, /\bdsu\b/i],
    segmentTree: [/\bSegTree\b/, /\bsegment_tree\b/i, /\bbuild\s*\(/, /\bquery\s*\(.*mid/, /\btree\s*\[2\s*\*/],
    bitOp: [/\s&\s/, /\s\|\s/, /\s\^\s/, /\s<<\s/, /\s>>\s/, /\~\w/, /\bxor\b/, /\band\b/, /\bor\b/],
    bfs: [/\bqueue\s*</, /\.push\s*\(/, /\bvisited\s*\[/, /\blevel\b/],
    dfs: [/\bvisited\s*\[/, /\bstack\s*</, /\bdfs\b/i, /\bdepth\b/],
    backtrack: [/\bbacktrack\b/i, /\bbacktracking\b/i],
    greedy: [/\bsort\s*\(/, /\bgreedy\b/i],
    divideConquer: [/\bmerge\s*\(/, /\bmergeSort\b/i, /\bdivide\b/i, /mid\s*=\s*\(\s*\w+\s*\+\s*\w+\s*\)/],
    graph: [/\badj\s*\[/, /\badjacency\b/, /\bgraph\b/i, /\bedge\b/i, /\bdijkstra\b/i],
    tree: [/\broot\b/, /\bleft\s*->/, /\bright\s*->/, /\bTreeNode\b/],
    sort: [/\bsort\s*\(/, /\bstable_sort\s*\(/],
  },

  java: {
    loop: [/\bfor\s*\(/, /\bwhile\s*\(/, /\bdo\s*\{/, /\bfor\s*\(\w+\s+\w+\s*:/],
    recursionCall: /\b(\w+)\s*\([^)]*\)\s*[;,)]/,
    hashMap: [/\bHashMap\s*</, /\bTreeMap\s*</, /\bLinkedHashMap\s*</],
    hashSet: [/\bHashSet\s*</, /\bTreeSet\s*</, /\bLinkedHashSet\s*</],
    binarySearch: [/\bCollections\.binarySearch\b/, /\bArrays\.binarySearch\b/, /mid\s*=\s*\(\s*(lo|left)\s*\+\s*(hi|right)\s*\)/],
    twoPointer: [/\bleft\s*=\s*0/, /\bright\s*=\s*(n|nums\.length|arr\.length)/],
    slidingWindow: [/\bwindow\b/, /\(j\s*-\s*i\)/, /\(right\s*-\s*left\)/],
    memoization: [/\bmemo\[/, /\bdp\[.*\]\s*!=\s*-1/, /\bcache\.containsKey\b/],
    dpTable: [/\bint\[\]\[\]\s+dp/, /\bint\[\]\s+dp/, /\bdp\[i\]\[j\]/],
    stack: [/\bStack\s*</, /\bDeque\s*</, /\.push\s*\(/, /\.pop\s*\(/, /\.peek\s*\(/],
    queue: [/\bQueue\s*</, /\bLinkedList\s*</, /\.poll\s*\(/, /\.offer\s*\(/, /\.peek\s*\(/],
    heap: [/\bPriorityQueue\s*</, /\bTreeMap\b.*\.firstKey\b/],
    trie: [/\bTrie\b/, /\btrie\b/, /\bchildren\s*=\s*new\b/],
    unionFind: [/\bparent\s*\[/, /\bfind\s*\(/, /\bunion\s*\(/, /\brank\s*\[/],
    segmentTree: [/\bSegTree\b/, /\bSegmentTree\b/, /\bbuild\s*\(/, /\btree\s*=\s*new int\[/],
    bitOp: [/\s&\s/, /\s\|\s/, /\s\^\s/, /\s<<\s/, /\s>>\s/, /\~\w/],
    bfs: [/\bQueue\s*</, /\.offer\s*\(/, /\bvisited\s*\[/, /\blevel\b/],
    dfs: [/\bvisited\s*\[/, /\bStack\s*</, /\bdfs\b/i],
    backtrack: [/\bbacktrack\b/i, /\bbacktracking\b/i],
    greedy: [/\bCollections\.sort\b/, /\bArrays\.sort\b/, /\bgreedy\b/i],
    divideConquer: [/\bmerge\s*\(/, /\bmergeSort\b/i, /mid\s*=\s*\(\s*\w+\s*\+\s*\w+\s*\)/],
    graph: [/\badj\s*\[/, /\badjacency\b/, /\bgraph\b/i, /\bDijkstra\b/i],
    tree: [/\broot\b/, /\bleft\b/, /\bright\b/, /\bTreeNode\b/],
    sort: [/\bCollections\.sort\b/, /\bArrays\.sort\b/],
  },

  python: {
    loop: [/\bfor\s+\w+\s+in\b/, /\bwhile\s+/],
    recursionCall: /\b(\w+)\s*\([^)]*\)/,
    hashMap: [/\bdict\s*\(/, /\{\s*\}/, /\bdefaultdict\b/, /\bCounter\b/, /\bOrderedDict\b/],
    hashSet: [/\bset\s*\(/, /\{[^:]+\}/, /\bfrozenset\b/],
    binarySearch: [/\bbisect\b/, /\bbisect_left\b/, /\bbisect_right\b/, /mid\s*=\s*\(\s*(lo|left)\s*\+\s*(hi|right)\s*\)/],
    twoPointer: [/\bleft\s*=\s*0/, /\bright\s*=\s*(n|len\()/],
    slidingWindow: [/\bwindow\b/, /\(j\s*-\s*i\)/, /\(right\s*-\s*left\)/],
    memoization: [/\blru_cache\b/, /\bcache\b/, /\bmemo\b/, /@functools\.cache/, /@cache/],
    dpTable: [/\bdp\s*=\s*\[/, /\bdp\[i\]\[j\]/],
    stack: [/\bstack\s*=\s*\[/, /\.append\s*\(/, /\.pop\s*\(/],
    queue: [/\bdeque\s*\(/, /\bqueue\b/, /\.popleft\s*\(/],
    heap: [/\bheapq\b/, /\bheappush\b/, /\bheappop\b/],
    trie: [/\bTrie\b/, /\btrie\b/, /\bchildren\b/],
    unionFind: [/\bparent\s*=\s*\[/, /\bfind\s*\(/, /\bunion\s*\(/],
    segmentTree: [/\bSegTree\b/, /\bSegmentTree\b/, /\bseg_tree\b/],
    bitOp: [/\s&\s/, /\s\|\s/, /\s\^\s/, /\s<<\s/, /\s>>\s/, /\~\w/],
    bfs: [/\bdeque\s*\(/, /\bvisited\b/, /\.popleft\s*\(/],
    dfs: [/\bvisited\b/, /\bdfs\b/i, /\bstack\b/],
    backtrack: [/\bbacktrack\b/i, /\bbacktracking\b/i],
    greedy: [/\bsorted\s*\(/, /\.sort\s*\(/, /\bgreedy\b/i],
    divideConquer: [/\bmerge\s*\(/, /\bmerge_sort\b/i, /mid\s*=\s*(len|n)/, /\bdivide\b/i],
    graph: [/\badj\b/, /\badjacency\b/, /\bgraph\b/i, /\bdijkstra\b/i],
    tree: [/\broot\b/, /\bleft\b/, /\bright\b/, /\bTreeNode\b/],
    sort: [/\bsorted\s*\(/, /\.sort\s*\(/],
  },

  javascript: {
    loop: [/\bfor\s*\(/, /\bwhile\s*\(/, /\bfor\s*\(\s*const\b/, /\bfor\s*\(\s*let\b/, /\.forEach\b/, /\.map\s*\(/, /\.reduce\s*\(/],
    recursionCall: /\b(\w+)\s*\([^)]*\)/,
    hashMap: [/\bnew\s+Map\s*\(/, /\{\s*\}/, /\bObject\.fromEntries\b/],
    hashSet: [/\bnew\s+Set\s*\(/],
    binarySearch: [/mid\s*=\s*Math\.floor\s*\(\s*(lo|left)\s*\+\s*(hi|right)/, /\bMath\.floor\s*\(\s*\(lo\s*\+\s*hi\)/],
    twoPointer: [/\bleft\s*=\s*0/, /\bright\s*=\s*(n|nums\.length|arr\.length)/],
    slidingWindow: [/\bwindow\b/, /\(j\s*-\s*i\)/, /\(right\s*-\s*left\)/],
    memoization: [/\bcache\b/, /\bmemo\b/, /\bnew\s+Map\s*\(\)/, /\.has\s*\(/],
    dpTable: [/\bdp\s*=\s*\[/, /\bdp\s*=\s*Array/, /\bdp\[i\]\[j\]/],
    stack: [/\bstack\s*=\s*\[/, /\.push\s*\(/, /\.pop\s*\(/],
    queue: [/\bqueue\s*=\s*\[/, /\.shift\s*\(/, /\.push\s*\(/],
    heap: [/\bMinHeap\b/, /\bMaxHeap\b/, /\bheapify\b/],
    trie: [/\bTrie\b/, /\btrie\b/, /\bchildren\b/],
    unionFind: [/\bparent\b/, /\bfind\s*\(/, /\bunion\s*\(/],
    segmentTree: [/\bSegTree\b/, /\bSegmentTree\b/, /\bseg_tree\b/],
    bitOp: [/\s&\s/, /\s\|\s/, /\s\^\s/, /\s<<\s/, /\s>>\s/, /\~\w/],
    bfs: [/\bqueue\s*=\s*\[/, /\.shift\s*\(/, /\bvisited\b/],
    dfs: [/\bvisited\b/, /\bstack\b/, /\bdfs\b/i],
    backtrack: [/\bbacktrack\b/i],
    greedy: [/\.sort\s*\(/, /\bgreedy\b/i],
    divideConquer: [/\bmerge\s*\(/, /\bmergeSort\b/i, /\bMath\.floor\s*\(\s*(lo\+hi|left\+right)/],
    graph: [/\badj\b/, /\badjacency\b/, /\bgraph\b/i],
    tree: [/\broot\b/, /\bleft\b/, /\bright\b/, /\bTreeNode\b/],
    sort: [/\.sort\s*\(/],
  },

  go: {
    loop: [/\bfor\s+/, /\brange\s+/],
    recursionCall: /\b(\w+)\s*\([^)]*\)/,
    hashMap: [/\bmap\[/, /\bmake\(map\[/],
    hashSet: [/\bmap\[.*\]bool/, /\bmap\[.*\]struct\{\}/],
    binarySearch: [/\bsort\.Search\b/, /mid\s*:?=\s*\(lo\s*\+\s*hi\)/],
    twoPointer: [/\bleft\s*:?=\s*0/, /\bright\s*:?=\s*(n|len\()/],
    slidingWindow: [/\bwindow\b/i, /right\s*-\s*left/],
    memoization: [/\bcache\b/, /\bmemo\b/],
    dpTable: [/\bdp\s*:?=\s*make\(/, /\bdp\[i\]\[j\]/],
    stack: [/\bstack\s*:?=\s*\[/, /\bappend\s*\(stack/],
    queue: [/\bqueue\s*:?=\s*\[/, /\bappend\s*\(queue/],
    heap: [/\bheap\.Interface\b/, /\bcontainer\/heap\b/],
    trie: [/\bTrie\b/, /\bchildren\b/],
    unionFind: [/\bparent\b/, /\bfind\s*\(/, /\bunion\s*\(/],
    segmentTree: [/\bSegTree\b/, /\bsegTree\b/],
    bitOp: [/\s&\s/, /\s\|\s/, /\s\^\s/, /\s<<\s/, /\s>>\s/, /\^\w/],
    bfs: [/\bqueue\s*:?=\s*\[/, /\bvisited\b/, /\bappend\s*\(queue/],
    dfs: [/\bvisited\b/, /\bstack\b/, /\bdfs\b/i],
    backtrack: [/\bbacktrack\b/i],
    greedy: [/\bsort\.Slice\b/, /\bgreedy\b/i],
    divideConquer: [/\bmerge\s*\(/, /mid\s*:?=\s*\(lo\s*\+\s*hi\)/],
    graph: [/\badj\b/, /\badjacency\b/, /\bgraph\b/i],
    tree: [/\broot\b/, /\bLeft\b/, /\bRight\b/, /\bTreeNode\b/],
    sort: [/\bsort\.Slice\b/, /\bsort\.Ints\b/, /\bsort\.Strings\b/],
  },

  typescript: {
    loop: [/\bfor\s*\(/, /\bwhile\s*\(/, /\.forEach\b/, /\.map\s*\(/],
    recursionCall: /\b(\w+)\s*\([^)]*\)/,
    hashMap: [/\bnew\s+Map\s*</, /\bnew\s+Map\s*\(/],
    hashSet: [/\bnew\s+Set\s*</],
    binarySearch: [/mid\s*=\s*Math\.floor/],
    twoPointer: [/\bleft\s*=\s*0/, /\bright\s*=/],
    slidingWindow: [/\bwindow\b/, /right\s*-\s*left/],
    memoization: [/\bcache\b/, /\bmemo\b/],
    dpTable: [/\bdp\s*=\s*\[/, /\bdp\s*:\s*(number|string)\[\]\[\]/],
    stack: [/\bstack\s*:\s*\w+\[\]/, /\.push\s*\(/, /\.pop\s*\(/],
    queue: [/\bqueue\s*:\s*\w+\[\]/, /\.shift\s*\(/],
    heap: [/\bMinHeap\b/, /\bMaxHeap\b/, /\bheapify\b/],
    trie: [/\bTrie\b/, /\bchildren\b/],
    unionFind: [/\bparent\b/, /\bfind\s*\(/, /\bunion\s*\(/],
    segmentTree: [/\bSegTree\b/, /\bSegmentTree\b/],
    bitOp: [/\s&\s/, /\s\|\s/, /\s\^\s/, /\s<<\s/, /\s>>\s/],
    bfs: [/\bqueue\b/, /\.shift\s*\(/, /\bvisited\b/],
    dfs: [/\bvisited\b/, /\bstack\b/, /\bdfs\b/i],
    backtrack: [/\bbacktrack\b/i],
    greedy: [/\.sort\s*\(/],
    divideConquer: [/\bmerge\s*\(/, /mid\s*=\s*Math\.floor/],
    graph: [/\badj\b/, /\bgraph\b/i],
    tree: [/\broot\b/, /\bleft\b/, /\bright\b/],
    sort: [/\.sort\s*\(/],
  },
};

// ─────────────────────────────────────────────
// Core feature extraction
// ─────────────────────────────────────────────

function countPatternMatches(code: string, patterns: RegExp[]): number {
  return patterns.filter(p => p.test(code)).length;
}

/**
 * Extract code features using multi-pass heuristic analysis.
 * This is the "AST-lite" approach — we simulate AST by analyzing
 * structural patterns line-by-line and with regex patterns.
 */
export function extractCodeFeatures(code: string, language: Language): CodeFeatures {
  const langKey = language === 'unknown' ? 'javascript' : language;
  const patterns = PATTERNS[langKey] ?? PATTERNS.javascript;
  const lines = code.split('\n');

  // ── Loop depth analysis ──────────────────────
  let loopDepth = 0;
  let maxLoopDepth = 0;
  let loopCount = 0;
  let braceDepth = 0;
  const loopBraceStack: number[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*')) continue;

    const isLoop = patterns.loop.some(p => p.test(trimmed));
    if (isLoop) {
      loopCount++;
      loopBraceStack.push(braceDepth);
      loopDepth++;
      maxLoopDepth = Math.max(maxLoopDepth, loopDepth);
    }

    // Track brace depth
    const opens = (trimmed.match(/\{/g) ?? []).length;
    const closes = (trimmed.match(/\}/g) ?? []).length;
    braceDepth += opens - closes;

    // Pop loop stack when its brace closes
    if (closes > 0 && loopBraceStack.length > 0) {
      while (loopBraceStack.length > 0 && braceDepth <= loopBraceStack[loopBraceStack.length - 1]) {
        loopBraceStack.pop();
        loopDepth = Math.max(0, loopDepth - 1);
      }
    }
  }

  // ── Function detection & recursion ──────────
  const funcNames: string[] = [];
  const funcPattern = language === 'python'
    ? /\bdef\s+(\w+)\s*\(/
    : language === 'go'
    ? /\bfunc\s+(\w+)\s*\(/
    : /\b(?:function|void|int|bool|string|long|double|auto|public|private|static)\s+(\w+)\s*\(/;

  for (const line of lines) {
    const match = line.match(funcPattern);
    if (match) funcNames.push(match[1]);
  }

  const hasRecursion = funcNames.some(name => {
    if (!name || name === 'main') return false;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const callCount = (code.match(new RegExp(`\\b${escaped}\\s*\\(`, 'g')) ?? []).length;
    return callCount >= 2; // defined + called recursively
  });

  // Detect exponential recursion: multiple recursive calls without memoization
  const hasExponentialRecursion =
    hasRecursion &&
    funcNames.some(name => {
      if (!name || name === 'main') return false;
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const callCount = (code.match(new RegExp(`\\b${escaped}\\s*\\(`, 'g')) ?? []).length;
      return callCount >= 3;
    }) &&
    countPatternMatches(code, patterns.memoization) === 0;

  // ── Data structure detection ─────────────────
  const dataStructures = new Set<string>();
  if (countPatternMatches(code, patterns.hashMap) > 0) dataStructures.add('HashMap');
  if (countPatternMatches(code, patterns.hashSet) > 0) dataStructures.add('HashSet');
  if (countPatternMatches(code, patterns.stack) > 0) dataStructures.add('Stack');
  if (countPatternMatches(code, patterns.queue) > 0) dataStructures.add('Queue');
  if (countPatternMatches(code, patterns.heap) > 0) dataStructures.add('Heap');
  if (countPatternMatches(code, patterns.trie) > 0) dataStructures.add('Trie');

  // ── Max array dimensions ─────────────────────
  const twoDArray = /\[\s*\w+\s*\]\s*\[\s*\w+\s*\]/.test(code);
  const maxArrayDimensions = twoDArray ? 2 : (code.includes('[') ? 1 : 0);

  return {
    loopDepth: maxLoopDepth,
    loopCount,
    hasNestedLoop: maxLoopDepth >= 2,
    hasTripleNestedLoop: maxLoopDepth >= 3,

    hasRecursion,
    hasExponentialRecursion,

    dataStructures,

    hasBinarySearchPattern: countPatternMatches(code, patterns.binarySearch) >= 1,
    hasTwoPointerPattern: countPatternMatches(code, patterns.twoPointer) >= 2,
    hasSlidingWindowPattern: countPatternMatches(code, patterns.slidingWindow) >= 1,
    hasMemoization: countPatternMatches(code, patterns.memoization) >= 1,
    hasDPTable: countPatternMatches(code, patterns.dpTable) >= 1,
    hasStackUsage: countPatternMatches(code, patterns.stack) >= 2,
    hasQueueUsage: countPatternMatches(code, patterns.queue) >= 2,
    hasHeapUsage: countPatternMatches(code, patterns.heap) >= 1,
    hasTrieUsage: countPatternMatches(code, patterns.trie) >= 2,
    hasUnionFind: countPatternMatches(code, patterns.unionFind) >= 2,
    hasSegmentTree: countPatternMatches(code, patterns.segmentTree) >= 1,
    hasBitManipulation: countPatternMatches(code, patterns.bitOp) >= 2,
    hasBFS: countPatternMatches(code, patterns.bfs) >= 2,
    hasDFS: countPatternMatches(code, patterns.dfs) >= 2,
    hasBacktracking: countPatternMatches(code, patterns.backtrack) >= 1,
    hasGreedy: countPatternMatches(code, patterns.greedy) >= 1 && maxLoopDepth === 1,
    hasDivideAndConquer: countPatternMatches(code, patterns.divideConquer) >= 2,
    hasGraphAlgorithm: countPatternMatches(code, patterns.graph) >= 2,
    hasTreeTraversal: countPatternMatches(code, patterns.tree) >= 2,
    hasSorting: countPatternMatches(code, patterns.sort) >= 1,

    hasHashMap: countPatternMatches(code, patterns.hashMap) >= 1,
    hasHashSet: countPatternMatches(code, patterns.hashSet) >= 1,

    functionCount: funcNames.length,
    hasEarlyReturn: code.includes('return') && loopCount > 0,
    maxArrayDimensions,
    variableCount: (code.match(/\b(int|long|string|bool|auto|var|let|const)\s+\w+/g) ?? []).length,
  };
}
