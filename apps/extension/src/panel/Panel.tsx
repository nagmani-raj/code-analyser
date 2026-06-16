import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { AnalysisResult, ExtensionMessage } from '@dsa-analyzer/shared';
import { AnalysisReport } from '../components/AnalysisReport';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

type PanelState = 'loading' | 'success' | 'error' | 'idle';

// ─────────────────────────────────────────────
// Draggable Hook
// ─────────────────────────────────────────────

function useDraggable(initialPos: { x: number; y: number }) {
  const [pos, setPos] = useState(initialPos);
  const dragRef = useRef<{ startX: number; startY: number; panelX: number; panelY: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panelX: pos.x,
      panelY: pos.y,
    };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      setPos({ x: dragRef.current.panelX + dx, y: dragRef.current.panelY + dy });
    };

    const onMouseUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [pos]);

  return { pos, onMouseDown };
}

// ─────────────────────────────────────────────
// Floating Panel Component
// ─────────────────────────────────────────────

export default function Panel() {
  const [state, setState] = useState<PanelState>('idle');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [platform, setPlatform] = useState<string | null>(null);

  const { pos, onMouseDown } = useDraggable({ x: window.innerWidth - 320, y: 80 });

  useEffect(() => {
    // Detect platform from URL
    const host = window.location.hostname;
    if (host.includes('leetcode')) setPlatform('LeetCode');
    else if (host.includes('geeksforgeeks')) setPlatform('GeeksforGeeks');
    else if (host.includes('hackerrank')) setPlatform('HackerRank');
    else if (host.includes('codeforces')) setPlatform('Codeforces');

    // Load from storage
    chrome.storage.local.get(['currentAnalysis'], (data) => {
      if (data.currentAnalysis) {
        setAnalysis(data.currentAnalysis as AnalysisResult);
        setState('success');
      }
    });

    // Listen for messages
    const listener = (message: ExtensionMessage<unknown>) => {
      if (message.type === 'ANALYZE_RESPONSE') {
        setAnalysis(message.payload as AnalysisResult);
        setState('success');
        setError(null);
      } else if (message.type === 'ANALYZE_ERROR') {
        const err = message.payload as { message: string };
        setError(err.message);
        setState('error');
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const handleReAnalyze = useCallback(() => {
    setState('loading');
    setError(null);
    chrome.runtime.sendMessage({ type: 'ANALYZE_REQUEST', payload: {} });
  }, []);

  return (
    <div
      id="dsa-analyzer-panel"
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: 2147483647,
        width: collapsed ? 'auto' : '280px',
        userSelect: 'none',
      }}
      className="animate-slide-in"
    >
      {/* Panel Shell */}
      <div className="glass-card overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}>
        {/* Drag Handle / Header */}
        <div
          onMouseDown={onMouseDown}
          className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800 cursor-grab active:cursor-grabbing bg-slate-900/60"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <span className="text-white text-xs">⚡</span>
            </div>
            {!collapsed && (
              <span className="text-xs font-semibold text-slate-300">DSA Analyzer</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!collapsed && (
              <button
                onClick={handleReAnalyze}
                className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-all text-xs"
                title="Re-analyze"
              >
                ↺
              </button>
            )}
            <button
              onClick={() => setCollapsed(c => !c)}
              className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-all text-xs"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? '▸' : '▾'}
            </button>
          </div>
        </div>

        {/* Content */}
        {!collapsed && (
          <div className="p-3">
            {state === 'idle' && (
              <div className="text-center py-4">
                <p className="text-xs text-slate-500">Waiting for code…</p>
                <button
                  onClick={handleReAnalyze}
                  className="mt-2 px-3 py-1.5 text-xs rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                >
                  Analyze Now
                </button>
              </div>
            )}
            {state === 'loading' && <LoadingState />}
            {state === 'success' && analysis && (
              <AnalysisReport
                language={analysis.language}
                approach={analysis.approach}
                timeComplexity={analysis.timeComplexity}
                spaceComplexity={analysis.spaceComplexity}
                optimization={analysis.optimization}
                confidence={analysis.confidence}
                platform={platform ?? undefined}
                details={analysis.details}
              />
            )}
            {state === 'error' && (
              <ErrorState message={error ?? undefined} onRetry={handleReAnalyze} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
