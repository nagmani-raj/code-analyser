// ─────────────────────────────────────────────
// Enums & Union Types
// ─────────────────────────────────────────────

export type Language = 'cpp' | 'java' | 'python' | 'javascript' | 'typescript' | 'go' | 'unknown';

export type Approach =
  | 'Brute Force'
  | 'Two Pointer'
  | 'Sliding Window'
  | 'Hashing'
  | 'Binary Search'
  | 'Dynamic Programming'
  | 'Greedy'
  | 'DFS'
  | 'BFS'
  | 'Backtracking'
  | 'Recursion'
  | 'Stack'
  | 'Queue'
  | 'Heap / Priority Queue'
  | 'Graph'
  | 'Tree'
  | 'Trie'
  | 'Segment Tree'
  | 'Union Find (DSU)'
  | 'Bit Manipulation'
  | 'Divide and Conquer'
  | 'Unknown';

export type TimeComplexity =
  | 'O(1)'
  | 'O(log n)'
  | 'O(n)'
  | 'O(n log n)'
  | 'O(n²)'
  | 'O(n³)'
  | 'O(2^n)'
  | 'O(n!)'
  | 'Unknown';

export type SpaceComplexity = 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n²)' | 'Unknown';

export type OptimizationStatus = 'Optimized' | 'Can Be Optimized' | 'Not Optimized' | 'Unknown';

export type Platform = 'leetcode' | 'geeksforgeeks' | 'hackerrank' | 'codeforces' | 'unknown';

// ─────────────────────────────────────────────
// API Request / Response
// ─────────────────────────────────────────────

export interface AnalysisRequest {
  code: string;
  language: Language;
  platform?: Platform;
}

export interface AnalysisResult {
  language: string;
  approach: Approach;
  timeComplexity: TimeComplexity;
  spaceComplexity: SpaceComplexity;
  optimization: OptimizationStatus;
  confidence: number; // 0–1 confidence score
  details?: {
    loopDepth?: number;
    hasRecursion?: boolean;
    dataStructures?: string[];
    patterns?: string[];
  };
}

export interface AnalysisResponse extends AnalysisResult {
  id?: string;
  analyzedAt: string;
}

export interface AnalysisError {
  message: string;
  code: string;
}

// ─────────────────────────────────────────────
// Database Models (mirrors Prisma schema)
// ─────────────────────────────────────────────

export interface UserModel {
  id: string;
  email: string;
  createdAt: Date;
}

export interface AnalysisHistoryModel {
  id: string;
  userId?: string;
  code: string;
  language: Language;
  approach: Approach;
  timeComplexity: TimeComplexity;
  spaceComplexity: SpaceComplexity;
  optimization: OptimizationStatus;
  platform?: Platform;
  confidence: number;
  createdAt: Date;
}

// ─────────────────────────────────────────────
// Extension Messaging Types
// ─────────────────────────────────────────────

export type MessageType =
  | 'CODE_DETECTED'
  | 'ANALYZE_REQUEST'
  | 'ANALYZE_RESPONSE'
  | 'ANALYZE_ERROR'
  | 'GET_HISTORY'
  | 'HISTORY_RESPONSE';

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload: T;
  tabId?: number;
}

export interface CodeDetectedPayload {
  code: string;
  language: Language;
  platform: Platform;
  url: string;
}

// ─────────────────────────────────────────────
// Extension Storage Schema
// ─────────────────────────────────────────────

export interface ExtensionStorage {
  history: AnalysisHistoryModel[];
  settings: ExtensionSettings;
  currentAnalysis?: AnalysisResult;
}

export interface ExtensionSettings {
  backendUrl: string;
  useLocalAnalysis: boolean;
  autoAnalyze: boolean;
  showPanel: boolean;
  theme: 'dark' | 'light' | 'system';
}
