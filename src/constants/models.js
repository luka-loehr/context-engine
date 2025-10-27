/**
 * AI Model definitions and configurations
 */

export const MODELS = {
  openai: {
    'gpt-5': { name: 'GPT-5', provider: 'openai' },
    'gpt-5-mini': { name: 'GPT-5 Mini', provider: 'openai' },
    'gpt-5-nano': { name: 'GPT-5 Nano', provider: 'openai' }
  },
  anthropic: {
    'claude-sonnet-4-5': { name: 'Claude Sonnet 4.5', provider: 'anthropic' },
    'claude-haiku-4-5': { name: 'Claude Haiku 4.5', provider: 'anthropic' },
    'claude-opus-4-1': { name: 'Claude Opus 4.1', provider: 'anthropic' }
  },
  xai: {
    'grok-code-fast-1': { name: 'Grok Code Fast 1', provider: 'xai' },
    'grok-4-fast-reasoning': { name: 'Grok 4 Fast Reasoning', provider: 'xai', isThinkingModel: true },
    'grok-4-fast-non-reasoning': { name: 'Grok 4 Fast Non Reasoning', provider: 'xai' }
  },
  google: {
    'gemini-2.5-pro': { name: 'Gemini 2.5 Pro', provider: 'google', isThinkingModel: true },
    'gemini-flash-latest': { name: 'Gemini Flash Latest', provider: 'google' },
    'gemini-flash-lite-latest': { name: 'Gemini Flash Lite Latest', provider: 'google' }
  },
  ollama: {}
};

export const PROVIDER_CHOICES = [
  { name: '🤖 OpenAI (Best coding: GPT-5 74.9% SWE-bench)', value: 'openai' },
  { name: '🧠 Anthropic (Fastest: Haiku 4.5, Deep reasoning: Opus 4.1)', value: 'anthropic' },
  { name: '🚀 xAI (2M context Grok 4, Coding: Grok Code Fast)', value: 'xai' },
  { name: '🌟 Google (1M context, Best price/perf: Flash)', value: 'google' },
  { name: '🦙 Ollama (Local models)', value: 'ollama' }
];

export const MODEL_CHOICES = {
  openai: [
    { name: 'GPT-5 (Best coding: 74.9% SWE-bench)', value: 'gpt-5' },
    { name: 'GPT-5 Mini (Balanced: 71% coding, 2× faster)', value: 'gpt-5-mini' },
    { name: 'GPT-5 Nano (Fastest: 3× speed, lowest cost)', value: 'gpt-5-nano' }
  ],
  anthropic: [
    { name: 'Claude Sonnet 4.5 (Top coding, 1M context)', value: 'claude-sonnet-4-5' },
    { name: 'Claude Haiku 4.5 (Fastest, 1/3 cost, 90% quality)', value: 'claude-haiku-4-5' },
    { name: 'Claude Opus 4.1 (Deepest reasoning: 74.5% SWE)', value: 'claude-opus-4-1' }
  ],
  xai: [
    { name: 'Grok Code Fast 1 (Coding specialist: 70.8%)', value: 'grok-code-fast-1' },
    { name: 'Grok 4 Fast Reasoning (2M context, deep thinking)', value: 'grok-4-fast-reasoning' },
    { name: 'Grok 4 Fast Non Reasoning (Fastest, cheapest)', value: 'grok-4-fast-non-reasoning' }
  ],
  google: [
    { name: 'Gemini 2.5 Pro (Best reasoning, 1M context)', value: 'gemini-2.5-pro' },
    { name: 'Gemini Flash Latest (Best price/performance)', value: 'gemini-flash-latest' },
    { name: 'Gemini Flash Lite Latest (Fastest, lowest cost)', value: 'gemini-flash-lite-latest' }
  ]
};

/**
 * Get all available models including Ollama
 */
export function getAllModels() {
  return { 
    ...MODELS.openai, 
    ...MODELS.anthropic, 
    ...MODELS.xai, 
    ...MODELS.google, 
    ...MODELS.ollama 
  };
}

/**
 * Update Ollama models dynamically
 */
export function updateOllamaModels(models) {
  MODELS.ollama = models;
}

