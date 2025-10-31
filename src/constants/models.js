import chalk from 'chalk';

/**
 * AI Model definitions
 */

export const MODELS = {
  // Default: Cheapest XAI model as "context-engine"
  'context-engine': {
    name: 'context-engine',
    provider: 'xai',
    model: 'grok-4-fast-non-reasoning',
    description: 'Cheapest XAI model – fastest responses with minimal reasoning overhead'
  },
  // Ultra: xAI Grok-4 reasoning as "context-engine-ultra"
  'context-engine-ultra': {
    name: 'context-engine-ultra',
    provider: 'xai',
    model: 'grok-4-fast-reasoning',
    description: 'Premium reasoning model – deep analysis with reduced hallucinations'
  }
};

export const MODEL_CHOICES = [
  { name: `${chalk.magenta('context-engine-ultra')} (Premium reasoning model)`, value: 'context-engine-ultra' },
  { name: `${chalk.white('context-engine')} (Cheapest XAI model)`, value: 'context-engine' }
];

/**
 * Get all available models
 */
export function getAllModels() {
  return MODELS;
}
