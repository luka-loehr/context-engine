/**
 * Context window limits for different AI models (in tokens)
 * Based on official documentation and benchmarks
 */

export const CONTEXT_LIMITS = {
  // OpenAI models
  'gpt-5': 128000,
  'gpt-5-mini': 128000,
  'gpt-5-nano': 128000,
  
  // Anthropic models
  'claude-sonnet-4-5': 200000,
  'claude-haiku-4-5': 200000,
  'claude-opus-4-1': 200000,
  
  // xAI models
  'grok-code-fast-1': 128000,
  'grok-4-fast-reasoning': 2000000,  // 2M context
  'grok-4-fast-non-reasoning': 2000000,
  
  // Google models
  'gemini-2.5-pro': 1000000,  // 1M context
  'gemini-flash-latest': 1000000,
  'gemini-flash-lite-latest': 1000000,
  
  // Default for Ollama and unknown models
  'default': 128000
};

/**
 * Get context limit for a model
 */
export function getContextLimit(modelId) {
  return CONTEXT_LIMITS[modelId] || CONTEXT_LIMITS['default'];
}

