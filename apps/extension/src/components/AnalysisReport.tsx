import React from 'react';
import type { OptimizationStatus, TimeComplexity, Approach } from '@dsa-analyzer/shared';

// ─────────────────────────────────────────────
// Complexity Badge Colors
// ─────────────────────────────────────────────

function getComplexityBadgeClass(complexity: string): string {
  if (['O(1)', 'O(log n)'].includes(complexity)) return 'badge-green';
  if (['O(n)', 'O(n log n)'].includes(complexity)) return 'badge-blue';
  if (['O(n²)', 'O(n³)'].includes(complexity)) return 'badge-yellow';
  if (['O(2^n)', 'O(n!)'].includes(complexity)) return 'badge-red';
  return 'badge-gray';
}

function getOptimizationBadgeClass(status: OptimizationStatus): string {
  switch (status) {
    case 'Optimized': return 'badge-green';
    case 'Can Be Optimized': return 'badge-yellow';
    case 'Not Optimized': return 'badge-red';
    default: return 'badge-gray';
  }
}

function getApproachBadgeClass(approach: Approach): string {
  const greenApproaches = ['Two Pointer', 'Sliding Window', 'Binary Search', 'Hashing'];
  const blueApproaches = ['BFS', 'DFS', 'Dynamic Programming', 'Greedy'];
  const purpleApproaches = ['Trie', 'Segment Tree', 'Union Find (DSU)', 'Heap / Priority Queue'];

  if (greenApproaches.includes(approach)) return 'badge-green';
  if (blueApproaches.includes(approach)) return 'badge-blue';
  if (purpleApproaches.includes(approach)) return 'badge-purple';
  if (approach === 'Brute Force') return 'badge-red';
  return 'badge-gray';
}

function getOptimizationIcon(status: OptimizationStatus): string {
  switch (status) {
    case 'Optimized': return '✓';
    case 'Can Be Optimized': return '⚡';
    case 'Not Optimized': return '✗';
    default: return '?';
  }
}

// ─────────────────────────────────────────────
// Confidence Bar
// ─────────────────────────────────────────────

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 80 ? '#4ade80' : pct >= 60 ? '#facc15' : '#f87171';

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs text-slate-400 font-mono w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Analysis Report Component
// ─────────────────────────────────────────────

export interface AnalysisReportProps {
  language: string;
  approach: Approach;
  timeComplexity: TimeComplexity;
  spaceComplexity: string;
  optimization: OptimizationStatus;
  confidence: number;
  platform?: string;
  details?: {
    loopDepth?: number;
    hasRecursion?: boolean;
    dataStructures?: string[];
    patterns?: string[];
  };
  analyzedAt?: string;
}

export function AnalysisReport({
  language,
  approach,
  timeComplexity,
  spaceComplexity,
  optimization,
  confidence,
  platform,
  details,
  analyzedAt,
}: AnalysisReportProps) {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Analysis Report
          </span>
        </div>
        {platform && (
          <span className="badge badge-gray text-xs">{platform}</span>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="space-y-2">
        {/* Language */}
        <div className="metric-row">
          <span className="metric-label">Language</span>
          <span className="badge badge-blue font-mono">{language}</span>
        </div>

        {/* Approach */}
        <div className="metric-row">
          <span className="metric-label">Approach</span>
          <span className={`badge ${getApproachBadgeClass(approach)}`}>
            {approach}
          </span>
        </div>

        {/* Time Complexity */}
        <div className="metric-row">
          <span className="metric-label">Time Complexity</span>
          <span className={`badge font-mono ${getComplexityBadgeClass(timeComplexity)}`}>
            {timeComplexity}
          </span>
        </div>

        {/* Space Complexity */}
        <div className="metric-row">
          <span className="metric-label">Space Complexity</span>
          <span className={`badge font-mono ${getComplexityBadgeClass(spaceComplexity)}`}>
            {spaceComplexity}
          </span>
        </div>

        {/* Optimization */}
        <div className="metric-row">
          <span className="metric-label">Optimization</span>
          <span className={`badge ${getOptimizationBadgeClass(optimization)}`}>
            <span>{getOptimizationIcon(optimization)}</span>
            {optimization}
          </span>
        </div>
      </div>

      {/* Confidence */}
      <div className="mt-3 px-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">Analysis Confidence</span>
        </div>
        <ConfidenceBar confidence={confidence} />
      </div>

      {/* Details */}
      {details && (
        <div className="mt-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
          <div className="flex flex-wrap gap-1.5">
            {details.loopDepth !== undefined && details.loopDepth > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                Loop depth: {details.loopDepth}
              </span>
            )}
            {details.hasRecursion && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                Recursive
              </span>
            )}
            {details.dataStructures?.map(ds => (
              <span key={ds} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-blue-400">
                {ds}
              </span>
            ))}
          </div>
          {details.patterns && details.patterns.length > 0 && (
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {details.patterns[0]}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      {analyzedAt && (
        <p className="text-xs text-slate-600 text-center mt-3">
          {new Date(analyzedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
