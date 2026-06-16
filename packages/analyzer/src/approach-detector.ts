import type { Approach } from '@dsa-analyzer/shared';
import type { CodeFeatures } from './ast-parser';

// ─────────────────────────────────────────────
// Approach Detection Rules
// Priority-ordered: more specific rules win
// ─────────────────────────────────────────────

interface ApproachCandidate {
  approach: Approach;
  confidence: number;
}

/**
 * Detect the algorithmic approach used in code based on extracted features.
 * Returns a ranked list of candidates (highest confidence first).
 */
export function detectApproach(features: CodeFeatures): ApproachCandidate[] {
  const candidates: ApproachCandidate[] = [];

  // ── Segment Tree ──────────────────────────────
  if (features.hasSegmentTree) {
    candidates.push({ approach: 'Segment Tree', confidence: 0.95 });
  }

  // ── Trie ──────────────────────────────────────
  if (features.hasTrieUsage) {
    candidates.push({ approach: 'Trie', confidence: 0.93 });
  }

  // ── Union Find (DSU) ──────────────────────────
  if (features.hasUnionFind) {
    candidates.push({ approach: 'Union Find (DSU)', confidence: 0.92 });
  }

  // ── Backtracking ──────────────────────────────
  if (features.hasBacktracking) {
    candidates.push({ approach: 'Backtracking', confidence: 0.92 });
  }

  // ── Binary Search (high priority — must beat sliding window) ────────────
  if (features.hasBinarySearchPattern) {
    candidates.push({ approach: 'Binary Search', confidence: 0.92 });
  }

  // ── Dynamic Programming ───────────────────────
  if (features.hasDPTable || (features.hasMemoization && features.hasRecursion)) {
    const confidence = features.hasDPTable && features.hasMemoization ? 0.95
      : features.hasDPTable ? 0.88
      : 0.82;
    candidates.push({ approach: 'Dynamic Programming', confidence });
  }

  // ── BFS ─────────────────────────────────────── 
  // Require queue + visited; but NOT heap (heap uses poll/offer too)
  if (features.hasBFS && features.hasQueueUsage && !features.hasHeapUsage) {
    candidates.push({ approach: 'BFS', confidence: 0.90 });
  }

  // ── DFS ───────────────────────────────────────
  if (features.hasDFS && (features.hasRecursion || features.hasStackUsage)) {
    candidates.push({ approach: 'DFS', confidence: 0.88 });
  }

  // ── Heap / Priority Queue ─────────────────────
  if (features.hasHeapUsage) {
    candidates.push({ approach: 'Heap / Priority Queue', confidence: 0.91 });
  }

  // ── Sliding Window ────────────────────────────
  // Only if no binary search already detected with high confidence
  if (features.hasSlidingWindowPattern && features.hasTwoPointerPattern && !features.hasBinarySearchPattern) {
    candidates.push({ approach: 'Sliding Window', confidence: 0.88 });
  } else if (features.hasSlidingWindowPattern && !features.hasBinarySearchPattern) {
    candidates.push({ approach: 'Sliding Window', confidence: 0.75 });
  }

  // ── Two Pointer ───────────────────────────────
  // Binary search also uses left/right pointers — exclude it
  if (features.hasTwoPointerPattern && !features.hasSlidingWindowPattern && !features.hasBinarySearchPattern) {
    candidates.push({ approach: 'Two Pointer', confidence: 0.85 });
  }

  // ── Hashing ───────────────────────────────────
  if ((features.hasHashMap || features.hasHashSet) && !features.hasDPTable) {
    const confidence = features.loopDepth === 1 ? 0.82 : 0.70;
    candidates.push({ approach: 'Hashing', confidence });
  }

  // ── Bit Manipulation ─────────────────────────
  if (features.hasBitManipulation && features.loopDepth <= 1) {
    candidates.push({ approach: 'Bit Manipulation', confidence: 0.83 });
  }

  // ── Greedy ────────────────────────────────────
  if (features.hasGreedy && features.hasSorting && features.loopDepth <= 1) {
    candidates.push({ approach: 'Greedy', confidence: 0.78 });
  }

  // ── Stack ─────────────────────────────────────
  if (features.hasStackUsage && !features.hasDFS && !features.hasBFS) {
    candidates.push({ approach: 'Stack', confidence: 0.80 });
  }

  // ── Queue ─────────────────────────────────────
  if (features.hasQueueUsage && !features.hasBFS) {
    candidates.push({ approach: 'Queue', confidence: 0.78 });
  }

  // ── Graph ─────────────────────────────────────
  if (features.hasGraphAlgorithm) {
    candidates.push({ approach: 'Graph', confidence: 0.85 });
  }

  // ── Tree ──────────────────────────────────────
  if (features.hasTreeTraversal && !features.hasGraphAlgorithm) {
    candidates.push({ approach: 'Tree', confidence: 0.82 });
  }

  // ── Divide and Conquer ────────────────────────
  if (features.hasDivideAndConquer) {
    candidates.push({ approach: 'Divide and Conquer', confidence: 0.86 });
  }

  // ── Recursion (generic, if no more specific found) ──
  if (features.hasRecursion && candidates.length === 0) {
    candidates.push({ approach: 'Recursion', confidence: 0.65 });
  }

  // ── Brute Force ───────────────────────────────
  if (features.hasTripleNestedLoop && candidates.length === 0) {
    candidates.push({ approach: 'Brute Force', confidence: 0.80 });
  } else if (features.hasNestedLoop && !features.hasBinarySearchPattern && !features.hasDPTable && candidates.filter(c => c.confidence > 0.8).length === 0) {
    candidates.push({ approach: 'Brute Force', confidence: 0.60 });
  }

  // ── Unknown fallback ─────────────────────────
  if (candidates.length === 0) {
    candidates.push({ approach: 'Unknown', confidence: 0.3 });
  }

  // Sort by confidence descending
  candidates.sort((a, b) => b.confidence - a.confidence);
  return candidates;
}

/**
 * Get the primary approach (highest confidence).
 */
export function getPrimaryApproach(features: CodeFeatures): { approach: Approach; confidence: number } {
  const candidates = detectApproach(features);
  return candidates[0];
}
