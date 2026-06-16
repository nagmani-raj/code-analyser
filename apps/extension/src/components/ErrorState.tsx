import React from 'react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="animate-fade-in text-center py-4 px-2">
      <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
        <span className="text-red-400 text-lg">✗</span>
      </div>
      <p className="text-sm text-red-400 font-medium mb-1">Analysis Failed</p>
      <p className="text-xs text-slate-500 leading-relaxed mb-4">
        {message ?? 'Could not extract code from this page. Make sure you have code in the editor.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 text-xs rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
