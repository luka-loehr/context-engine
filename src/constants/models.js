/**
 * AI Model definitions
 */

export const MODELS = {
  // Default: Google Gemini Flash Lite as "promptx"
  'promptx': {
    name: 'promptx',
    provider: 'google',
    model: 'gemini-1.5-flash-8b',
    description: 'Google Gemini 1.5 Flash 8B (fast, cost-effective)'
  },
  // Ultra: xAI Grok-4 as "promptx-ultra"
  'promptx-ultra': {
    name: 'promptx-ultra',
    provider: 'xai',
    model: 'grok-4',
    description: 'xAI Grok-4 (higher quality)'
  }
};

export const MODEL_CHOICES = [
  { name: 'promptx (Google Gemini 1.5 Flash 8B)', value: 'promptx' },
  { name: 'promptx-ultra (xAI Grok-4)', value: 'promptx-ultra' }
];

/**
 * Get all available models
 */
export function getAllModels() {
  return MODELS;
}
