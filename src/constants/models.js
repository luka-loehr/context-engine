/**
 * AI Model definitions
 */

export const MODELS = {
  // Default: Google Gemini Flash Lite as "promptx"
  'promptx': {
    name: 'promptx',
    provider: 'google',
    model: 'gemini-flash-lite-latest',
    description: 'Google Gemini 2.5 Flash‑Lite (latest) – fastest, lowest cost'
  },
  // Ultra: xAI Grok-4 as "promptx-ultra"
  'promptx-ultra': {
    name: 'promptx-ultra',
    provider: 'xai',
    model: 'grok-4-fast-non-reasoning',
    description: 'xAI Grok‑4 Fast (non‑reasoning) – current normal set model'
  }
};

export const MODEL_CHOICES = [
  { name: 'promptx (Google Gemini Flash‑Lite latest)', value: 'promptx' },
  { name: 'promptx-ultra (xAI Grok‑4 Fast non‑reasoning)', value: 'promptx-ultra' }
];

/**
 * Get all available models
 */
export function getAllModels() {
  return MODELS;
}
