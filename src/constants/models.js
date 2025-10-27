/**
 * AI Model definitions
 */

export const MODELS = {
  'promptx': {
    name: 'promptx',
    provider: 'xai',
    model: 'grok-4-fast-non-reasoning',
    description: 'Codebase assistant with 2M context'
  }
};

export const MODEL_CHOICES = [
  { name: 'promptx (Codebase assistant with 2M context)', value: 'promptx' }
];

/**
 * Get all available models
 */
export function getAllModels() {
  return MODELS;
}
