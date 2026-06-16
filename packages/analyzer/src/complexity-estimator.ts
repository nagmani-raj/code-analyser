import type { TimeComplexity, SpaceComplexity } from '@dsa-analyzer/shared';
import type { CodeFeatures } from './ast-parser';

export interface ComplexityEstimate {
  time: TimeComplexity;
  space: SpaceComplexity;
  timeReasoning: string;
  spaceReasoning: string;
}

// ─────────────────────────────────────────────
// Time Complexity Estimation
// ─────────────────────────────────────────────

function estimateTimeComplexity(features: CodeFeatures): { complexity: TimeComplexity; reasoning: string } {
  // O(n!) — factorial: backtracking over permutations
  if (features.hasBacktracking && features.hasExponentialRecursion) {
    return { complexity: 'O(n!)', reasoning: 'Backtracking with permutation-like branching detected' };
  }

  // O(2^n) — exponential recursion without memoization
  if (features.hasExponentialRecursion && !features.hasMemoization) {
    return { complexity: 'O(2^n)', reasoning: 'Multiple recursive calls without memoization → exponential branching' };
  }

  // O(n) amortized — Sliding Window with nested shrink loop (still O(n) total)
  if (features.hasSlidingWindowPattern) {
    return { complexity: 'O(n)', reasoning: 'Sliding window — nested shrink loop is O(n) amortized (each element enters/leaves once)' };
  }

  // O(n³) — triple nested loops (only if NOT a DP table which may have 2 nested loops + comprehension)
  if (features.hasTripleNestedLoop && !features.hasDPTable) {
    return { complexity: 'O(n³)', reasoning: 'Triple nested loops detected' };
  }

  // O(n²) — double nested loops (without optimization)
  if (features.hasNestedLoop && !features.hasBinarySearchPattern && !features.hasDPTable && !features.hasHashMap && !features.hasSlidingWindowPattern && !features.hasUnionFind) {
    return { complexity: 'O(n²)', reasoning: 'Nested loops without inner optimization → quadratic time' };
  }

  // O(n log n) — sorting + single pass, or divide and conquer
  if (features.hasSorting && features.loopDepth <= 1) {
    return { complexity: 'O(n log n)', reasoning: 'Sorting call detected (comparison sort is O(n log n))' };
  }
  if (features.hasDivideAndConquer) {
    return { complexity: 'O(n log n)', reasoning: 'Divide and conquer with linear merge → O(n log n)' };
  }

  // O(n log n) — nested loop where inner is binary search
  if (features.hasNestedLoop && features.hasBinarySearchPattern) {
    return { complexity: 'O(n log n)', reasoning: 'Outer loop O(n) × Binary search O(log n) = O(n log n)' };
  }

  // O(n) — DP with memoization (linear DP)
  if (features.hasDPTable && features.loopDepth === 1) {
    return { complexity: 'O(n)', reasoning: '1D DP with single-pass iteration' };
  }
  if (features.hasDPTable && features.loopDepth >= 2) {
    return { complexity: 'O(n²)', reasoning: '2D DP table → O(n²) time' };
  }

  // O(n) — single loop, or BFS/DFS (visits each node once)
  if (features.hasBFS || features.hasDFS) {
    return { complexity: 'O(n)', reasoning: 'BFS/DFS visits each node/edge once → O(V + E) ≈ O(n)' };
  }

  // O(log n) — binary search
  if (features.hasBinarySearchPattern && !features.hasNestedLoop) {
    return { complexity: 'O(log n)', reasoning: 'Binary search halves search space each iteration' };
  }

  // O(n) — linear scan
  if (features.loopCount >= 1 && features.loopDepth === 1) {
    return { complexity: 'O(n)', reasoning: 'Single loop over input → linear time' };
  }

  // O(n) — recursion with memoization (assume linear cached calls)
  if (features.hasRecursion && features.hasMemoization) {
    return { complexity: 'O(n)', reasoning: 'Memoized recursion → each subproblem solved once' };
  }

  // O(n) — simple recursion without exponential branching
  if (features.hasRecursion && !features.hasExponentialRecursion) {
    return { complexity: 'O(n)', reasoning: 'Linear recursion (single recursive call)' };
  }

  // O(1) — no loops, no recursion
  if (features.loopCount === 0 && !features.hasRecursion) {
    return { complexity: 'O(1)', reasoning: 'No loops or recursion → constant time operations' };
  }

  return { complexity: 'Unknown', reasoning: 'Could not determine time complexity' };
}

// ─────────────────────────────────────────────
// Space Complexity Estimation
// ─────────────────────────────────────────────

function estimateSpaceComplexity(features: CodeFeatures): { complexity: SpaceComplexity; reasoning: string } {
  // O(n²) — 2D arrays or 2D DP table
  if (features.maxArrayDimensions >= 2 || (features.hasDPTable && features.loopDepth >= 2)) {
    return { complexity: 'O(n²)', reasoning: '2D array/DP table requires O(n²) extra space' };
  }

  // O(n) — HashMap, HashSet, DP array, recursion stack, trie, graph adj
  if (
    features.hasHashMap ||
    features.hasHashSet ||
    (features.hasDPTable && features.loopDepth <= 1) ||
    features.hasTrieUsage ||
    features.hasGraphAlgorithm ||
    features.hasQueueUsage ||
    features.hasStackUsage ||
    features.hasBFS ||
    (features.hasRecursion && !features.hasMemoization)
  ) {
    const reasons: string[] = [];
    if (features.hasHashMap || features.hasHashSet) reasons.push('hash map/set');
    if (features.hasDPTable) reasons.push('DP array');
    if (features.hasTrieUsage) reasons.push('Trie nodes');
    if (features.hasQueueUsage || features.hasBFS) reasons.push('queue for BFS');
    if (features.hasStackUsage) reasons.push('explicit stack');
    if (features.hasRecursion && !features.hasMemoization) reasons.push('call stack');
    return {
      complexity: 'O(n)',
      reasoning: `Extra space from: ${reasons.join(', ')}`,
    };
  }

  // O(log n) — recursion call stack for divide-and-conquer / binary search
  if (features.hasDivideAndConquer || features.hasBinarySearchPattern) {
    return { complexity: 'O(log n)', reasoning: 'Recursive call stack depth O(log n)' };
  }

  // O(1) — no extra memory allocated
  return { complexity: 'O(1)', reasoning: 'No extra data structures → constant space' };
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

export function estimateComplexity(features: CodeFeatures): ComplexityEstimate {
  const { complexity: time, reasoning: timeReasoning } = estimateTimeComplexity(features);
  const { complexity: space, reasoning: spaceReasoning } = estimateSpaceComplexity(features);

  return { time, space, timeReasoning, spaceReasoning };
}
