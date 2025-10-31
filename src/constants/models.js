import chalk from 'chalk';

/**
 * AI Model definitions
 */

export const MODELS = {
  // Default: Cheapest XAI model as "promptx"
  'promptx': {
    name: 'promptx',
    provider: 'xai',
    model: 'grok-4-fast-non-reasoning',
    description: 'Cheapest XAI model – fastest responses with minimal reasoning overhead'
  },
  // Ultra: xAI Grok-4 reasoning as "promptx-ultra"
  'promptx-ultra': {
    name: 'promptx-ultra',
    provider: 'xai',
    model: 'grok-4-fast-reasoning',
    description: 'Premium reasoning model – deep analysis with reduced hallucinations'
  }
};

export const MODEL_CHOICES = [
  { name: `${chalk.magenta('promptx-ultra')} (Premium reasoning model)`, value: 'promptx-ultra' },
  { name: `${chalk.white('promptx')} (Cheapest XAI model)`, value: 'promptx' }
];

/**
 * Get all available models
 */
export function getAllModels() {
  return MODELS;
}
