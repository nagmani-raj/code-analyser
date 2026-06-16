import React from 'react';

export function LoadingState() {
  return (
    <div className="animate-fade-in space-y-3 p-1">
      {/* Header skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
        <div className="skeleton h-3 w-28 rounded" />
      </div>

      {/* Metric skeletons */}
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className="metric-row"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-5 w-24 rounded-full" />
        </div>
      ))}

      {/* Analyzing text */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-brand-400"
              style={{
                animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <span className="text-xs text-slate-500">Analyzing code…</span>
      </div>
    </div>
  );
}
