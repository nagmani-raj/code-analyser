import React, { useState, useEffect, useCallback } from 'react';
import type {
  AnalysisResult,
  ExtensionMessage,
  ExtensionSettings,
  ExtensionStorage,
} from '@dsa-analyzer/shared';
import { PLATFORM_DISPLAY_NAMES } from '@dsa-analyzer/shared';
import { AnalysisReport } from '../components/AnalysisReport';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Tab = 'analysis' | 'history' | 'settings';
type AppState = 'idle' | 'loading' | 'success' | 'error';

interface HistoryItem extends AnalysisResult {
  id: string;
  platform?: string;
  createdAt: Date;
}

// ─────────────────────────────────────────────
// Tab Bar
// ─────────────────────────────────────────────

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'analysis', label: 'Analysis', icon: '◎' },
    { key: 'history', label: 'History', icon: '◷' },
    { key: 'settings', label: 'Settings', icon: '⚙' },
  ];
  return (
    <div className="flex border-b border-slate-800">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${
            active === t.key
              ? 'text-brand-400 border-b-2 border-brand-400 -mb-px'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// History Item Card
// ─────────────────────────────────────────────

function HistoryCard({ item }: { item: HistoryItem }) {
  const optimizationColors = {
    Optimized: 'text-green-400',
    'Can Be Optimized': 'text-yellow-400',
    'Not Optimized': 'text-red-400',
    Unknown: 'text-slate-400',
  };

  return (
    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="badge badge-blue text-xs font-mono">{item.language}</span>
        <span className={`text-xs font-medium ${optimizationColors[item.optimization]}`}>
          {item.optimization}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="text-slate-300 font-medium">{item.approach}</span>
        <span>·</span>
        <span className="font-mono">{item.timeComplexity}</span>
        <span>·</span>
        <span className="font-mono">{item.spaceComplexity}</span>
      </div>
      {item.platform && (
        <div className="mt-1 text-xs text-slate-600">
          {PLATFORM_DISPLAY_NAMES[item.platform as keyof typeof PLATFORM_DISPLAY_NAMES] ?? item.platform}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Settings Tab
// ─────────────────────────────────────────────

function SettingsView({
  settings,
  onSave,
}: {
  settings: ExtensionSettings;
  onSave: (s: ExtensionSettings) => void;
}) {
  const [local, setLocal] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Analysis Mode */}
      <div>
        <label className="text-xs text-slate-400 uppercase tracking-wider font-medium block mb-2">
          Analysis Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { val: true, label: '⚡ Local', sub: 'Fast & private' },
            { val: false, label: '☁ Backend', sub: 'With history' },
          ].map(opt => (
            <button
              key={String(opt.val)}
              onClick={() => setLocal(prev => ({ ...prev, useLocalAnalysis: opt.val }))}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                local.useLocalAnalysis === opt.val
                  ? 'bg-brand-600/20 border-brand-500/50 text-brand-300'
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="text-xs font-semibold">{opt.label}</div>
              <div className="text-xs opacity-60 mt-0.5">{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Backend URL */}
      {!local.useLocalAnalysis && (
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider font-medium block mb-1.5">
            Backend URL
          </label>
          <input
            value={local.backendUrl}
            onChange={e => setLocal(prev => ({ ...prev, backendUrl: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
            placeholder="http://localhost:3001"
          />
        </div>
      )}

      {/* Auto Analyze */}
      <div className="flex items-center justify-between py-2 border-t border-slate-800">
        <div>
          <div className="text-xs font-medium text-slate-300">Auto Analyze</div>
          <div className="text-xs text-slate-500">Analyze when code changes</div>
        </div>
        <button
          onClick={() => setLocal(prev => ({ ...prev, autoAnalyze: !prev.autoAnalyze }))}
          className={`w-10 h-5 rounded-full transition-colors relative ${
            local.autoAnalyze ? 'bg-brand-500' : 'bg-slate-700'
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
              local.autoAnalyze ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
      >
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('analysis');
  const [appState, setAppState] = useState<AppState>('idle');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ExtensionSettings>({
    backendUrl: 'http://localhost:3001',
    useLocalAnalysis: true,
    autoAnalyze: true,
    showPanel: true,
    theme: 'dark',
  });
  const [currentPlatform, setCurrentPlatform] = useState<string | null>(null);

  // Load stored data on mount
  useEffect(() => {
    chrome.storage.local.get(['currentAnalysis', 'history', 'settings'], (data: Partial<ExtensionStorage>) => {
      if (data.currentAnalysis) {
        setAnalysis(data.currentAnalysis);
        setAppState('success');
      }
      if (data.history) {
        setHistory(data.history as HistoryItem[]);
      }
      if (data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    });

    // Detect current tab platform
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const url = tabs[0]?.url ?? '';
      if (url.includes('leetcode.com')) setCurrentPlatform('LeetCode');
      else if (url.includes('geeksforgeeks.org')) setCurrentPlatform('GeeksforGeeks');
      else if (url.includes('hackerrank.com')) setCurrentPlatform('HackerRank');
      else if (url.includes('codeforces.com')) setCurrentPlatform('Codeforces');
    });

    // Listen for analysis updates from background
    const listener = (message: ExtensionMessage<unknown>) => {
      if (message.type === 'ANALYZE_RESPONSE') {
        setAnalysis(message.payload as AnalysisResult);
        setAppState('success');
        setError(null);
      } else if (message.type === 'ANALYZE_ERROR') {
        const err = message.payload as { message: string };
        setError(err.message);
        setAppState('error');
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const handleManualAnalyze = useCallback(() => {
    setAppState('loading');
    setError(null);

    // Send message to content script to trigger analysis
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { type: 'ANALYZE_REQUEST', payload: {} });
      }
    });

    // Timeout fallback
    setTimeout(() => {
      if (appState === 'loading') {
        setAppState('error');
        setError('No code editor detected on this page. Open a problem on LeetCode, GFG, HackerRank, or Codeforces.');
      }
    }, 5000);
  }, [appState]);

  const handleSaveSettings = useCallback((newSettings: ExtensionSettings) => {
    setSettings(newSettings);
    chrome.storage.local.set({ settings: newSettings });
  }, []);

  return (
    <div
      className="w-80 min-h-[400px] max-h-[560px] flex flex-col"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <span className="text-white text-sm font-bold">⚡</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">DSA Analyzer</h1>
              {currentPlatform && (
                <p className="text-xs text-slate-500">{currentPlatform}</p>
              )}
            </div>
          </div>
          {appState !== 'loading' && (
            <button
              id="refresh-btn"
              onClick={handleManualAnalyze}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              title="Re-analyze"
            >
              <span className="text-xs">↺</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="p-4">
            {appState === 'idle' && (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/20 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <p className="text-sm font-medium text-slate-300 mb-1">Ready to Analyze</p>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                  Open a problem on LeetCode, GFG, HackerRank, or Codeforces. Analysis starts automatically.
                </p>
                <button
                  id="analyze-btn"
                  onClick={handleManualAnalyze}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-semibold transition-all shadow-lg shadow-brand-500/20 active:scale-95"
                >
                  Analyze Current Code
                </button>
              </div>
            )}

            {appState === 'loading' && <LoadingState />}

            {appState === 'success' && analysis && (
              <div className="glass-card p-4">
                <AnalysisReport
                  language={analysis.language}
                  approach={analysis.approach}
                  timeComplexity={analysis.timeComplexity}
                  spaceComplexity={analysis.spaceComplexity}
                  optimization={analysis.optimization}
                  confidence={analysis.confidence}
                  platform={currentPlatform ?? undefined}
                  details={analysis.details}
                />
              </div>
            )}

            {appState === 'error' && (
              <ErrorState message={error ?? undefined} onRetry={handleManualAnalyze} />
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="p-4 animate-fade-in">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">No analysis history yet.</p>
                <p className="text-slate-600 text-xs mt-1">Analyze some code to see history here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-3">
                  Last {history.length} analysis{history.length !== 1 ? 'es' : ''}
                </p>
                {history.map((item, i) => (
                  <HistoryCard key={item.id ?? i} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsView settings={settings} onSave={handleSaveSettings} />
        )}
      </div>
    </div>
  );
}
