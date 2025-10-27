/**
 * AI Model definitions
 */

export const MODELS = {
  'promptx-fast': {
    name: 'promptx-fast',
    provider: 'google',
    model: 'gemini-flash-lite-latest',
    description: 'Fastest, lowest cost, 1M context'
  },
  'promptx': {
    name: 'promptx',
    provider: 'google',
    model: 'gemini-flash-latest',
    description: 'Fast & balanced, 1M context (default)'
  },
  'promptx-pro': {
    name: 'promptx-pro',
    provider: 'xai',
    model: 'grok-4-fast-non-reasoning',
    description: 'Most capable, 2M context'
  }
};

export const MODEL_CHOICES = [
  { name: 'promptx-fast (Fastest, lowest cost, 1M context)', value: 'promptx-fast' },
  { name: 'promptx (Fast & balanced, 1M context - default)', value: 'promptx' },
  { name: 'promptx-pro (Most capable, 2M context)', value: 'promptx-pro' }
];

/**
 * Get all available models
 */
export function getAllModels() {
  return MODELS;
}
