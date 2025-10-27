/**
 * Context window limits for different AI models (in tokens)
 * Based on official documentation and benchmarks
 */

export const CONTEXT_LIMITS = {
  // promptx models
  'promptx-fast': 1000000,  // 1M context (Gemini Flash Lite)
  'promptx': 1000000,  // 1M context (Gemini Flash)
  'promptx-pro': 1000000,  // 1M context (Gemini Pro)
  'promptx-ultra': 2000000,  // 2M context (Grok 4 Fast)
  
  // Default for unknown models
  'default': 1000000
};

/**
 * Get context limit for a model
 */
export function getContextLimit(modelId) {
  return CONTEXT_LIMITS[modelId] || CONTEXT_LIMITS['default'];
}

