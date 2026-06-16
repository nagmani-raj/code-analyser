// packages/shared/src/constants.ts
var LANGUAGE_DISPLAY_NAMES = {
  cpp: "C++",
  java: "Java",
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  go: "Go",
  unknown: "Unknown"
};
var LEETCODE_LANGUAGE_MAP = {
  "C++": "cpp",
  Java: "java",
  Python: "python",
  "Python3": "python",
  JavaScript: "javascript",
  TypeScript: "typescript",
  Go: "go",
  Golang: "go"
};
var GFG_LANGUAGE_MAP = {
  "C++": "cpp",
  Java: "java",
  Python3: "python",
  Python: "python",
  JavaScript: "javascript"
};
var HACKERRANK_LANGUAGE_MAP = {
  cpp: "cpp",
  cpp14: "cpp",
  cpp17: "cpp",
  java: "java",
  java8: "java",
  java15: "java",
  python3: "python",
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  go: "go"
};
var CODEFORCES_LANGUAGE_MAP = {
  "GNU G++17 7.3.0": "cpp",
  "GNU G++20 11.2.0": "cpp",
  "GNU G++14 6.4.0": "cpp",
  "Java 11": "java",
  "Java 17": "java",
  "PyPy 3": "python",
  "Python 3": "python",
  "Python 3.8.12": "python",
  "Node.js 12.16.3": "javascript",
  "TypeScript 4.5": "typescript",
  "Go 1.19.1": "go"
};
var MIN_CODE_LENGTH = 20;

// packages/analyzer/src/language-detector.ts
var LANGUAGE_SIGNATURES = [
  {
    language: "cpp",
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
      /\bauto\s+\w+\s*=/
    ]
  },
  {
    language: "java",
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
      /\bScanner\s+\w+\s*=/
    ]
  },
  {
    language: "python",
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
      /\bFalse\b/
    ]
  },
  {
    language: "typescript",
    weight: 10,
    patterns: [
      /:\s*(string|number|boolean|void|any|never)\b/,
      /\binterface\s+\w+/,
      /\btype\s+\w+\s*=/,
      /\benum\s+\w+/,
      /\bReadonly\s*</,
      /\bPartial\s*</,
      /\bRecord\s*</,
      /\bimport\s+type\b/
    ]
  },
  {
    language: "javascript",
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
      /\bdocument\./
    ]
  },
  {
    language: "go",
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
      /:=\s/
    ]
  }
];
function detectLanguageFromCode(code) {
  const scores = {};
  for (const sig of LANGUAGE_SIGNATURES) {
    let score = 0;
    for (const pattern of sig.patterns) {
      if (pattern.test(code)) score += sig.weight;
    }
    if (score > 0) scores[sig.language] = (scores[sig.language] ?? 0) + score;
  }
  let best = "unknown";
  let bestScore = 0;
  for (const [lang, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = lang;
    }
  }
  return best;
}
function normalizePlatformLanguage(label, platform) {
  const maps = {
    leetcode: LEETCODE_LANGUAGE_MAP,
    geeksforgeeks: GFG_LANGUAGE_MAP,
    hackerrank: HACKERRANK_LANGUAGE_MAP,
    codeforces: CODEFORCES_LANGUAGE_MAP,
    unknown: {}
  };
  const map = maps[platform] ?? {};
  if (map[label]) return map[label];
  const lower = label.toLowerCase();
  for (const [key, val] of Object.entries(map)) {
    if (key.toLowerCase() === lower) return val;
  }
  return "unknown";
}

// packages/analyzer/src/ast-parser.ts
var PATTERNS = {
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
    sort: [/\bsort\s*\(/, /\bstable_sort\s*\(/]
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
    sort: [/\bCollections\.sort\b/, /\bArrays\.sort\b/]
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
    sort: [/\bsorted\s*\(/, /\.sort\s*\(/]
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
    sort: [/\.sort\s*\(/]
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
    sort: [/\bsort\.Slice\b/, /\bsort\.Ints\b/, /\bsort\.Strings\b/]
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
    sort: [/\.sort\s*\(/]
  }
};
function countPatternMatches(code, patterns) {
  return patterns.filter((p) => p.test(code)).length;
}
function extractCodeFeatures(code, language) {
  const langKey = language === "unknown" ? "javascript" : language;
  const patterns = PATTERNS[langKey] ?? PATTERNS.javascript;
  const lines = code.split("\n");
  let loopDepth = 0;
  let maxLoopDepth = 0;
  let loopCount = 0;
  let braceDepth = 0;
  const loopBraceStack = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("*")) continue;
    const isLoop = patterns.loop.some((p) => p.test(trimmed));
    if (isLoop) {
      loopCount++;
      loopBraceStack.push(braceDepth);
      loopDepth++;
      maxLoopDepth = Math.max(maxLoopDepth, loopDepth);
    }
    const opens = (trimmed.match(/\{/g) ?? []).length;
    const closes = (trimmed.match(/\}/g) ?? []).length;
    braceDepth += opens - closes;
    if (closes > 0 && loopBraceStack.length > 0) {
      while (loopBraceStack.length > 0 && braceDepth <= loopBraceStack[loopBraceStack.length - 1]) {
        loopBraceStack.pop();
        loopDepth = Math.max(0, loopDepth - 1);
      }
    }
  }
  const funcNames = [];
  const funcPattern = language === "python" ? /\bdef\s+(\w+)\s*\(/ : language === "go" ? /\bfunc\s+(\w+)\s*\(/ : /\b(?:function|void|int|bool|string|long|double|auto|public|private|static)\s+(\w+)\s*\(/;
  for (const line of lines) {
    const match = line.match(funcPattern);
    if (match) funcNames.push(match[1]);
  }
  const hasRecursion = funcNames.some((name) => {
    if (!name || name === "main") return false;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const callCount = (code.match(new RegExp(`\\b${escaped}\\s*\\(`, "g")) ?? []).length;
    return callCount >= 2;
  });
  const hasExponentialRecursion = hasRecursion && funcNames.some((name) => {
    if (!name || name === "main") return false;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const callCount = (code.match(new RegExp(`\\b${escaped}\\s*\\(`, "g")) ?? []).length;
    return callCount >= 3;
  }) && countPatternMatches(code, patterns.memoization) === 0;
  const dataStructures = /* @__PURE__ */ new Set();
  if (countPatternMatches(code, patterns.hashMap) > 0) dataStructures.add("HashMap");
  if (countPatternMatches(code, patterns.hashSet) > 0) dataStructures.add("HashSet");
  if (countPatternMatches(code, patterns.stack) > 0) dataStructures.add("Stack");
  if (countPatternMatches(code, patterns.queue) > 0) dataStructures.add("Queue");
  if (countPatternMatches(code, patterns.heap) > 0) dataStructures.add("Heap");
  if (countPatternMatches(code, patterns.trie) > 0) dataStructures.add("Trie");
  const twoDArray = /\[\s*\w+\s*\]\s*\[\s*\w+\s*\]/.test(code);
  const maxArrayDimensions = twoDArray ? 2 : code.includes("[") ? 1 : 0;
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
    hasEarlyReturn: code.includes("return") && loopCount > 0,
    maxArrayDimensions,
    variableCount: (code.match(/\b(int|long|string|bool|auto|var|let|const)\s+\w+/g) ?? []).length
  };
}

// packages/analyzer/src/approach-detector.ts
function detectApproach(features) {
  const candidates = [];
  if (features.hasSegmentTree) {
    candidates.push({ approach: "Segment Tree", confidence: 0.95 });
  }
  if (features.hasTrieUsage) {
    candidates.push({ approach: "Trie", confidence: 0.93 });
  }
  if (features.hasUnionFind) {
    candidates.push({ approach: "Union Find (DSU)", confidence: 0.92 });
  }
  if (features.hasBacktracking) {
    candidates.push({ approach: "Backtracking", confidence: 0.92 });
  }
  if (features.hasBinarySearchPattern) {
    candidates.push({ approach: "Binary Search", confidence: 0.92 });
  }
  if (features.hasDPTable || features.hasMemoization && features.hasRecursion) {
    const confidence = features.hasDPTable && features.hasMemoization ? 0.95 : features.hasDPTable ? 0.88 : 0.82;
    candidates.push({ approach: "Dynamic Programming", confidence });
  }
  if (features.hasBFS && features.hasQueueUsage && !features.hasHeapUsage) {
    candidates.push({ approach: "BFS", confidence: 0.9 });
  }
  if (features.hasDFS && (features.hasRecursion || features.hasStackUsage)) {
    candidates.push({ approach: "DFS", confidence: 0.88 });
  }
  if (features.hasHeapUsage) {
    candidates.push({ approach: "Heap / Priority Queue", confidence: 0.91 });
  }
  if (features.hasSlidingWindowPattern && features.hasTwoPointerPattern && !features.hasBinarySearchPattern) {
    candidates.push({ approach: "Sliding Window", confidence: 0.88 });
  } else if (features.hasSlidingWindowPattern && !features.hasBinarySearchPattern) {
    candidates.push({ approach: "Sliding Window", confidence: 0.75 });
  }
  if (features.hasTwoPointerPattern && !features.hasSlidingWindowPattern && !features.hasBinarySearchPattern) {
    candidates.push({ approach: "Two Pointer", confidence: 0.85 });
  }
  if ((features.hasHashMap || features.hasHashSet) && !features.hasDPTable) {
    const confidence = features.loopDepth === 1 ? 0.82 : 0.7;
    candidates.push({ approach: "Hashing", confidence });
  }
  if (features.hasBitManipulation && features.loopDepth <= 1) {
    candidates.push({ approach: "Bit Manipulation", confidence: 0.83 });
  }
  if (features.hasGreedy && features.hasSorting && features.loopDepth <= 1) {
    candidates.push({ approach: "Greedy", confidence: 0.78 });
  }
  if (features.hasStackUsage && !features.hasDFS && !features.hasBFS) {
    candidates.push({ approach: "Stack", confidence: 0.8 });
  }
  if (features.hasQueueUsage && !features.hasBFS) {
    candidates.push({ approach: "Queue", confidence: 0.78 });
  }
  if (features.hasGraphAlgorithm) {
    candidates.push({ approach: "Graph", confidence: 0.85 });
  }
  if (features.hasTreeTraversal && !features.hasGraphAlgorithm) {
    candidates.push({ approach: "Tree", confidence: 0.82 });
  }
  if (features.hasDivideAndConquer) {
    candidates.push({ approach: "Divide and Conquer", confidence: 0.86 });
  }
  if (features.hasRecursion && candidates.length === 0) {
    candidates.push({ approach: "Recursion", confidence: 0.65 });
  }
  if (features.hasTripleNestedLoop && candidates.length === 0) {
    candidates.push({ approach: "Brute Force", confidence: 0.8 });
  } else if (features.hasNestedLoop && !features.hasBinarySearchPattern && !features.hasDPTable && candidates.filter((c) => c.confidence > 0.8).length === 0) {
    candidates.push({ approach: "Brute Force", confidence: 0.6 });
  }
  if (candidates.length === 0) {
    candidates.push({ approach: "Unknown", confidence: 0.3 });
  }
  candidates.sort((a, b) => b.confidence - a.confidence);
  return candidates;
}
function getPrimaryApproach(features) {
  const candidates = detectApproach(features);
  return candidates[0];
}

// packages/analyzer/src/complexity-estimator.ts
function estimateTimeComplexity(features) {
  if (features.hasBacktracking && features.hasExponentialRecursion) {
    return { complexity: "O(n!)", reasoning: "Backtracking with permutation-like branching detected" };
  }
  if (features.hasExponentialRecursion && !features.hasMemoization) {
    return { complexity: "O(2^n)", reasoning: "Multiple recursive calls without memoization \u2192 exponential branching" };
  }
  if (features.hasSlidingWindowPattern) {
    return { complexity: "O(n)", reasoning: "Sliding window \u2014 nested shrink loop is O(n) amortized (each element enters/leaves once)" };
  }
  if (features.hasTripleNestedLoop && !features.hasDPTable) {
    return { complexity: "O(n\xB3)", reasoning: "Triple nested loops detected" };
  }
  if (features.hasNestedLoop && !features.hasBinarySearchPattern && !features.hasDPTable && !features.hasHashMap && !features.hasSlidingWindowPattern && !features.hasUnionFind) {
    return { complexity: "O(n\xB2)", reasoning: "Nested loops without inner optimization \u2192 quadratic time" };
  }
  if (features.hasSorting && features.loopDepth <= 1) {
    return { complexity: "O(n log n)", reasoning: "Sorting call detected (comparison sort is O(n log n))" };
  }
  if (features.hasDivideAndConquer) {
    return { complexity: "O(n log n)", reasoning: "Divide and conquer with linear merge \u2192 O(n log n)" };
  }
  if (features.hasNestedLoop && features.hasBinarySearchPattern) {
    return { complexity: "O(n log n)", reasoning: "Outer loop O(n) \xD7 Binary search O(log n) = O(n log n)" };
  }
  if (features.hasDPTable && features.loopDepth === 1) {
    return { complexity: "O(n)", reasoning: "1D DP with single-pass iteration" };
  }
  if (features.hasDPTable && features.loopDepth >= 2) {
    return { complexity: "O(n\xB2)", reasoning: "2D DP table \u2192 O(n\xB2) time" };
  }
  if (features.hasBFS || features.hasDFS) {
    return { complexity: "O(n)", reasoning: "BFS/DFS visits each node/edge once \u2192 O(V + E) \u2248 O(n)" };
  }
  if (features.hasBinarySearchPattern && !features.hasNestedLoop) {
    return { complexity: "O(log n)", reasoning: "Binary search halves search space each iteration" };
  }
  if (features.loopCount >= 1 && features.loopDepth === 1) {
    return { complexity: "O(n)", reasoning: "Single loop over input \u2192 linear time" };
  }
  if (features.hasRecursion && features.hasMemoization) {
    return { complexity: "O(n)", reasoning: "Memoized recursion \u2192 each subproblem solved once" };
  }
  if (features.hasRecursion && !features.hasExponentialRecursion) {
    return { complexity: "O(n)", reasoning: "Linear recursion (single recursive call)" };
  }
  if (features.loopCount === 0 && !features.hasRecursion) {
    return { complexity: "O(1)", reasoning: "No loops or recursion \u2192 constant time operations" };
  }
  return { complexity: "Unknown", reasoning: "Could not determine time complexity" };
}
function estimateSpaceComplexity(features) {
  if (features.maxArrayDimensions >= 2 || features.hasDPTable && features.loopDepth >= 2) {
    return { complexity: "O(n\xB2)", reasoning: "2D array/DP table requires O(n\xB2) extra space" };
  }
  if (features.hasHashMap || features.hasHashSet || features.hasDPTable && features.loopDepth <= 1 || features.hasTrieUsage || features.hasGraphAlgorithm || features.hasQueueUsage || features.hasStackUsage || features.hasBFS || features.hasRecursion && !features.hasMemoization) {
    const reasons = [];
    if (features.hasHashMap || features.hasHashSet) reasons.push("hash map/set");
    if (features.hasDPTable) reasons.push("DP array");
    if (features.hasTrieUsage) reasons.push("Trie nodes");
    if (features.hasQueueUsage || features.hasBFS) reasons.push("queue for BFS");
    if (features.hasStackUsage) reasons.push("explicit stack");
    if (features.hasRecursion && !features.hasMemoization) reasons.push("call stack");
    return {
      complexity: "O(n)",
      reasoning: `Extra space from: ${reasons.join(", ")}`
    };
  }
  if (features.hasDivideAndConquer || features.hasBinarySearchPattern) {
    return { complexity: "O(log n)", reasoning: "Recursive call stack depth O(log n)" };
  }
  return { complexity: "O(1)", reasoning: "No extra data structures \u2192 constant space" };
}
function estimateComplexity(features) {
  const { complexity: time, reasoning: timeReasoning } = estimateTimeComplexity(features);
  const { complexity: space, reasoning: spaceReasoning } = estimateSpaceComplexity(features);
  return { time, space, timeReasoning, spaceReasoning };
}

// packages/analyzer/src/optimization-evaluator.ts
function evaluateOptimization(features, approach, timeComplexity) {
  if (approach === "Union Find (DSU)") {
    return { status: "Optimized", reason: "Union-Find with path compression is already near-constant per operation" };
  }
  if (approach === "BFS" || approach === "DFS") {
    return { status: "Optimized", reason: "Graph traversal visits each node and edge once in the intended pattern" };
  }
  if (timeComplexity === "O(n!)") {
    return { status: "Not Optimized", reason: "Factorial time complexity suggests brute-force search without enough pruning" };
  }
  if (timeComplexity === "O(2^n)" && approach !== "Backtracking") {
    return { status: "Not Optimized", reason: "Exponential recursion without memoization can likely be reduced with DP" };
  }
  if (features.hasTripleNestedLoop && !features.hasBinarySearchPattern && !features.hasUnionFind) {
    return { status: "Not Optimized", reason: "Triple nested loops usually indicate a cubic brute-force approach" };
  }
  const isNestedLoopOptimalApproach = features.hasUnionFind || features.hasBFS || features.hasDFS || features.hasSlidingWindowPattern;
  if (features.hasNestedLoop && !features.hasHashMap && !features.hasHashSet && !features.hasDPTable && !features.hasBinarySearchPattern && !isNestedLoopOptimalApproach) {
    if (approach === "Brute Force") {
      return { status: "Can Be Optimized", reason: "Nested loops may be reducible with hashing, two pointers, or a window" };
    }
    return { status: "Can Be Optimized", reason: "Nested iteration may be reducible with a better data structure" };
  }
  if (timeComplexity === "O(2^n)" && features.hasMemoization) {
    return { status: "Can Be Optimized", reason: "Memoization helps, but a bottom-up DP may still improve stack usage" };
  }
  if (features.hasSorting && approach === "Greedy" && !features.hasHashMap) {
    return { status: "Can Be Optimized", reason: "Sorting may be replaceable with a heap or counting-based approach" };
  }
  if (timeComplexity === "O(1)") {
    return { status: "Optimized", reason: "Constant-time work is already optimal" };
  }
  if (timeComplexity === "O(log n)") {
    return { status: "Optimized", reason: "Logarithmic time is already highly efficient" };
  }
  if ((approach === "Two Pointer" || approach === "Sliding Window") && timeComplexity === "O(n)") {
    return { status: "Optimized", reason: "Single-pass pointer movement is optimal for this class of problems" };
  }
  if (approach === "Hashing" && timeComplexity === "O(n)") {
    return { status: "Optimized", reason: "Hash-based lookup keeps the solution linear overall" };
  }
  if (approach === "Dynamic Programming") {
    return { status: "Optimized", reason: "Overlapping subproblems are being solved in the intended DP form" };
  }
  if (approach === "Binary Search") {
    return { status: "Optimized", reason: "Binary search is optimal once the search space is ordered" };
  }
  if (approach === "Heap / Priority Queue") {
    return { status: "Optimized", reason: "Heap usage matches the expected optimal selection strategy" };
  }
  if (features.loopCount >= 1 && !features.hasNestedLoop && timeComplexity === "O(n)") {
    return { status: "Optimized", reason: "A single linear pass is already efficient" };
  }
  if (approach === "Backtracking") {
    return { status: "Optimized", reason: "Backtracking is the intended exact-search technique for this problem family" };
  }
  return { status: "Unknown", reason: "Insufficient information to determine optimization status" };
}

// packages/analyzer/src/index.ts
function analyzeCode(code, options = {}) {
  const trimmedCode = code.trim();
  if (trimmedCode.length < MIN_CODE_LENGTH) {
    return {
      language: "Unknown",
      approach: "Unknown",
      timeComplexity: "Unknown",
      spaceComplexity: "Unknown",
      optimization: "Unknown",
      confidence: 0,
      details: {}
    };
  }
  const detectedLanguage = options.language && options.language !== "unknown" ? options.language : detectLanguageFromCode(trimmedCode);
  const features = extractCodeFeatures(trimmedCode, detectedLanguage);
  const { approach, confidence: approachConfidence } = getPrimaryApproach(features);
  const { time, space, timeReasoning, spaceReasoning } = estimateComplexity(features);
  const { status: optimization } = evaluateOptimization(features, approach, time);
  const overallConfidence = Math.round(approachConfidence * 100) / 100;
  return {
    language: LANGUAGE_DISPLAY_NAMES[detectedLanguage] ?? "Unknown",
    approach,
    timeComplexity: time,
    spaceComplexity: space,
    optimization,
    confidence: overallConfidence,
    details: {
      loopDepth: features.loopDepth,
      hasRecursion: features.hasRecursion,
      dataStructures: Array.from(features.dataStructures),
      patterns: [timeReasoning, spaceReasoning].filter(Boolean)
    }
  };
}
export {
  analyzeCode,
  detectApproach,
  detectLanguageFromCode,
  estimateComplexity,
  evaluateOptimization,
  extractCodeFeatures,
  getPrimaryApproach,
  normalizePlatformLanguage
};
