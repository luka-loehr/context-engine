import chalk from 'chalk';

/**
 * AI Model definitions
 */

export const MODELS = {
  // Default: Fast model as "context"
  'context': {
    name: 'context',
    provider: 'xai',
    model: 'grok-4-fast-non-reasoning',
    description: 'Fast model – fastest responses with minimal reasoning overhead'
  },
  // Ultra: Premium reasoning model as "context-ultra"
  'context-ultra': {
    name: 'context-ultra',
    provider: 'xai',
    model: 'grok-4-fast-reasoning',
    description: 'Premium reasoning model – deep analysis with reduced hallucinations'
  }
};

export const MODEL_CHOICES = [
  { name: `${chalk.white('context')} (Fast model)`, value: 'context' },
  { name: `${chalk.magenta('context-ultra')} (Premium reasoning model)`, value: 'context-ultra' }
];

/**
 * Get all available models
 */
export function getAllModels() {
  return MODELS;
}
