import type { Language, AnalysisResult } from '@dsa-analyzer/shared';
import { LANGUAGE_DISPLAY_NAMES, MIN_CODE_LENGTH } from '@dsa-analyzer/shared';
import { detectLanguageFromCode } from './language-detector';
import { extractCodeFeatures } from './ast-parser';
import { getPrimaryApproach } from './approach-detector';
import { estimateComplexity } from './complexity-estimator';
import { evaluateOptimization } from './optimization-evaluator';

export { detectLanguageFromCode, normalizePlatformLanguage } from './language-detector';
export { extractCodeFeatures } from './ast-parser';
export { detectApproach, getPrimaryApproach } from './approach-detector';
export { estimateComplexity } from './complexity-estimator';
export { evaluateOptimization } from './optimization-evaluator';

// ─────────────────────────────────────────────
// Main Analyzer API
// ─────────────────────────────────────────────

export interface AnalyzeOptions {
  language?: Language;
}

/**
 * Analyze code and return a full DSA analysis report.
 *
 * @param code - Source code to analyze
 * @param options - Optional language hint (if not provided, auto-detected)
 * @returns Complete AnalysisResult
 */
export function analyzeCode(code: string, options: AnalyzeOptions = {}): AnalysisResult {
  const trimmedCode = code.trim();

  // Guard: too short to analyze
  if (trimmedCode.length < MIN_CODE_LENGTH) {
    return {
      language: 'Unknown',
      approach: 'Unknown',
      timeComplexity: 'Unknown',
      spaceComplexity: 'Unknown',
      optimization: 'Unknown',
      confidence: 0,
      details: {},
    };
  }

  // Step 1: Language detection
  const detectedLanguage: Language =
    options.language && options.language !== 'unknown'
      ? options.language
      : detectLanguageFromCode(trimmedCode);

  // Step 2: Feature extraction (AST-lite)
  const features = extractCodeFeatures(trimmedCode, detectedLanguage);

  // Step 3: Approach detection
  const { approach, confidence: approachConfidence } = getPrimaryApproach(features);

  // Step 4: Complexity estimation
  const { time, space, timeReasoning, spaceReasoning } = estimateComplexity(features);

  // Step 5: Optimization evaluation
  const { status: optimization } = evaluateOptimization(features, approach, time);

  // Step 6: Overall confidence
  const overallConfidence = Math.round(approachConfidence * 100) / 100;

  return {
    language: LANGUAGE_DISPLAY_NAMES[detectedLanguage] ?? 'Unknown',
    approach,
    timeComplexity: time,
    spaceComplexity: space,
    optimization,
    confidence: overallConfidence,
    details: {
      loopDepth: features.loopDepth,
      hasRecursion: features.hasRecursion,
      dataStructures: Array.from(features.dataStructures),
      patterns: [timeReasoning, spaceReasoning].filter(Boolean),
    },
  };
}
