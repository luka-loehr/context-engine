/**
 * AI Model definitions - promptx uses only Google Gemini models
 */

export const MODELS = {
  'promptx-fast': {
    name: 'promptx-fast',
    provider: 'google',
    model: 'gemini-flash-lite-latest',
    description: 'Fastest, lowest cost'
  },
  'promptx': {
    name: 'promptx',
    provider: 'google',
    model: 'gemini-flash-latest',
    description: 'Fast & balanced (default)'
  },
  'promptx-pro': {
    name: 'promptx-pro',
    provider: 'google',
    model: 'gemini-2.5-pro',
    description: 'Most capable, 1M context',
    isThinkingModel: true
  }
};

export const MODEL_CHOICES = [
  { name: 'promptx-fast (Fastest, lowest cost)', value: 'promptx-fast' },
  { name: 'promptx (Fast & balanced - default)', value: 'promptx' },
  { name: 'promptx-pro (Most capable, 1M context)', value: 'promptx-pro' }
];

/**
 * Get all available models
 */
export function getAllModels() {
  return MODELS;
}
