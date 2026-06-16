import type {
  ExtensionMessage,
  CodeDetectedPayload,
  AnalysisResult,
  ExtensionStorage,
  ExtensionSettings,
} from '@dsa-analyzer/shared';
import { MAX_HISTORY_ITEMS, DEFAULT_BACKEND_URL } from '@dsa-analyzer/shared';
import { analyzeCode } from '@dsa-analyzer/analyzer';

// ─────────────────────────────────────────────
// Default settings
// ─────────────────────────────────────────────

const DEFAULT_SETTINGS: ExtensionSettings = {
  backendUrl: DEFAULT_BACKEND_URL,
  useLocalAnalysis: true,
  autoAnalyze: true,
  showPanel: true,
  theme: 'dark',
};

// ─────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────

async function getStorage(): Promise<ExtensionStorage> {
  const data = await chrome.storage.local.get(['history', 'settings', 'currentAnalysis']);
  return {
    history: data['history'] ?? [],
    settings: { ...DEFAULT_SETTINGS, ...(data['settings'] ?? {}) },
    currentAnalysis: data['currentAnalysis'],
  };
}

async function setStorage(update: Partial<ExtensionStorage>): Promise<void> {
  await chrome.storage.local.set(update);
}

// ─────────────────────────────────────────────
// Analysis logic
// ─────────────────────────────────────────────

async function performAnalysis(
  payload: CodeDetectedPayload,
  settings: ExtensionSettings
): Promise<AnalysisResult> {
  if (settings.useLocalAnalysis) {
    // Local analysis using the analyzer package
    return analyzeCode(payload.code, { language: payload.language });
  }

  // Remote analysis via backend
  const response = await fetch(`${settings.backendUrl}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: payload.code,
      language: payload.language,
      platform: payload.platform,
    }),
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ─────────────────────────────────────────────
// Message Handler
// ─────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage<unknown>, sender, sendResponse) => {
    if (message.type === 'CODE_DETECTED') {
      const payload = message.payload as CodeDetectedPayload;

      // Handle async in MV3 service worker
      (async () => {
        try {
          const storage = await getStorage();

          if (!storage.settings.autoAnalyze) {
            sendResponse({ type: 'SKIPPED' });
            return;
          }

          const result = await performAnalysis(payload, storage.settings);

          // Save to storage
          const historyItem = {
            id: Date.now().toString(),
            ...result,
            language: result.language as string,
            code: payload.code,
            platform: payload.platform,
            createdAt: new Date(),
          };

          const newHistory = [historyItem, ...storage.history].slice(0, MAX_HISTORY_ITEMS);

          await setStorage({
            currentAnalysis: result,
            history: newHistory as ExtensionStorage['history'],
          });

          // Notify all extension pages (popup, panel)
          const responseMsg: ExtensionMessage<AnalysisResult> = {
            type: 'ANALYZE_RESPONSE',
            payload: result,
          };

          // Send to popup if open
          chrome.runtime.sendMessage(responseMsg).catch(() => {
            // Popup might not be open — silently ignore
          });

          // Send back to content script
          if (sender.tab?.id) {
            chrome.tabs.sendMessage(sender.tab.id, responseMsg).catch(() => {});
          }

          sendResponse(responseMsg);
        } catch (error) {
          const errorMsg: ExtensionMessage<{ message: string }> = {
            type: 'ANALYZE_ERROR',
            payload: {
              message: error instanceof Error ? error.message : 'Analysis failed',
            },
          };
          chrome.runtime.sendMessage(errorMsg).catch(() => {});
          sendResponse(errorMsg);
        }
      })();

      return true; // Keep message channel open for async response
    }

    if (message.type === 'GET_HISTORY') {
      (async () => {
        const storage = await getStorage();
        sendResponse({
          type: 'HISTORY_RESPONSE',
          payload: storage.history,
        });
      })();
      return true;
    }

    return false;
  }
);

// ─────────────────────────────────────────────
// Extension install/update handler
// ─────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    // Initialize storage with defaults
    setStorage({
      history: [],
      settings: DEFAULT_SETTINGS,
    });
    console.log('[DSA Analyzer] Extension installed!');
  }
});

console.log('[DSA Analyzer] Service worker started');
