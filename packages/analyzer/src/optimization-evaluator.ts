import type { OptimizationStatus, Approach, TimeComplexity } from '@dsa-analyzer/shared';
import type { CodeFeatures } from './ast-parser';

export interface OptimizationResult {
  status: OptimizationStatus;
  reason: string;
}

export function evaluateOptimization(
  features: CodeFeatures,
  approach: Approach,
  timeComplexity: TimeComplexity
): OptimizationResult {
  // These approaches are already near-optimal for the problems they target.
  if (approach === 'Union Find (DSU)') {
    return { status: 'Optimized', reason: 'Union-Find with path compression is already near-constant per operation' };
  }

  if (approach === 'BFS' || approach === 'DFS') {
    return { status: 'Optimized', reason: 'Graph traversal visits each node and edge once in the intended pattern' };
  }

  if (timeComplexity === 'O(n!)') {
    return { status: 'Not Optimized', reason: 'Factorial time complexity suggests brute-force search without enough pruning' };
  }

  if (timeComplexity === 'O(2^n)' && approach !== 'Backtracking') {
    return { status: 'Not Optimized', reason: 'Exponential recursion without memoization can likely be reduced with DP' };
  }

  if (features.hasTripleNestedLoop && !features.hasBinarySearchPattern && !features.hasUnionFind) {
    return { status: 'Not Optimized', reason: 'Triple nested loops usually indicate a cubic brute-force approach' };
  }

  const isNestedLoopOptimalApproach =
    features.hasUnionFind || features.hasBFS || features.hasDFS || features.hasSlidingWindowPattern;

  if (
    features.hasNestedLoop &&
    !features.hasHashMap &&
    !features.hasHashSet &&
    !features.hasDPTable &&
    !features.hasBinarySearchPattern &&
    !isNestedLoopOptimalApproach
  ) {
    if (approach === 'Brute Force') {
      return { status: 'Can Be Optimized', reason: 'Nested loops may be reducible with hashing, two pointers, or a window' };
    }

    return { status: 'Can Be Optimized', reason: 'Nested iteration may be reducible with a better data structure' };
  }

  if (timeComplexity === 'O(2^n)' && features.hasMemoization) {
    return { status: 'Can Be Optimized', reason: 'Memoization helps, but a bottom-up DP may still improve stack usage' };
  }

  if (features.hasSorting && approach === 'Greedy' && !features.hasHashMap) {
    return { status: 'Can Be Optimized', reason: 'Sorting may be replaceable with a heap or counting-based approach' };
  }

  if (timeComplexity === 'O(1)') {
    return { status: 'Optimized', reason: 'Constant-time work is already optimal' };
  }

  if (timeComplexity === 'O(log n)') {
    return { status: 'Optimized', reason: 'Logarithmic time is already highly efficient' };
  }

  if ((approach === 'Two Pointer' || approach === 'Sliding Window') && timeComplexity === 'O(n)') {
    return { status: 'Optimized', reason: 'Single-pass pointer movement is optimal for this class of problems' };
  }

  if (approach === 'Hashing' && timeComplexity === 'O(n)') {
    return { status: 'Optimized', reason: 'Hash-based lookup keeps the solution linear overall' };
  }

  if (approach === 'Dynamic Programming') {
    return { status: 'Optimized', reason: 'Overlapping subproblems are being solved in the intended DP form' };
  }

  if (approach === 'Binary Search') {
    return { status: 'Optimized', reason: 'Binary search is optimal once the search space is ordered' };
  }

  if (approach === 'Heap / Priority Queue') {
    return { status: 'Optimized', reason: 'Heap usage matches the expected optimal selection strategy' };
  }

  if (features.loopCount >= 1 && !features.hasNestedLoop && timeComplexity === 'O(n)') {
    return { status: 'Optimized', reason: 'A single linear pass is already efficient' };
  }

  if (approach === 'Backtracking') {
    return { status: 'Optimized', reason: 'Backtracking is the intended exact-search technique for this problem family' };
  }

  return { status: 'Unknown', reason: 'Insufficient information to determine optimization status' };
}
