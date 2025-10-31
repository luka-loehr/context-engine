import chalk from 'chalk';

/**
 * AI Model definitions
 */

export const MODELS = {
  // Default: Cheapest XAI model as "context"
  'context': {
    name: 'context',
    provider: 'xai',
    model: 'grok-4-fast-non-reasoning',
    description: 'Cheapest XAI model – fastest responses with minimal reasoning overhead'
  },
  // Ultra: xAI Grok-4 reasoning as "context-ultra"
  'context-ultra': {
    name: 'context-ultra',
    provider: 'xai',
    model: 'grok-4-fast-reasoning',
    description: 'Premium reasoning model – deep analysis with reduced hallucinations'
  }
};

export const MODEL_CHOICES = [
  { name: `${chalk.magenta('context-ultra')} (Premium reasoning model)`, value: 'context-ultra' },
  { name: `${chalk.white('context')} (Cheapest XAI model)`, value: 'context' }
];

/**
 * Get all available models
 */
export function getAllModels() {
  return MODELS;
}
