/**
 * Context window limits for different AI models (in tokens)
 * Based on official documentation and benchmarks
 */

export const CONTEXT_LIMITS = {
  // promptx model
  'promptx': 2000000,  // 2M context (Grok 4 Fast)
  
  // Default
  'default': 2000000
};

/**
 * Get context limit for a model
 */
export function getContextLimit(modelId) {
  return CONTEXT_LIMITS[modelId] || CONTEXT_LIMITS['default'];
}

