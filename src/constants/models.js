import chalk from 'chalk';

/**
 * AI Model definitions
 */

export const MODELS = {
  // Default: Google Gemini Flash Lite as "promptx"
  'promptx': {
    name: 'promptx',
    provider: 'google',
    model: 'gemini-flash-lite-latest',
    description: 'Fast & affordable – optimized for speed and cost efficiency'
  },
  // Ultra: xAI Grok-4 as "promptx-ultra"
  'promptx-ultra': {
    name: 'promptx-ultra',
    provider: 'xai',
    model: 'grok-4-fast-non-reasoning',
    description: 'Premium reasoning model – advanced capabilities with deep analysis'
  }
};

export const MODEL_CHOICES = [
  { name: `${chalk.magenta('promptx-ultra')} (Premium reasoning model)`, value: 'promptx-ultra' },
  { name: `${chalk.white('promptx')} (Fast & affordable)`, value: 'promptx' }
];

/**
 * Get all available models
 */
export function getAllModels() {
  return MODELS;
}
