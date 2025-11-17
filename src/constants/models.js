/**
 * Context Engine - Model Definitions
 * AI model configurations and provider integration
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import chalk from 'chalk';
import { providerRegistry } from '../providers/index.js';

/**
 * AI Model definitions - now uses provider registry
 */

export const MODELS = {
  'context': {
    name: 'context',
    provider: 'xai',
    model: 'grok-4-fast-non-reasoning',
    description: 'Fast model'
  },
  'context-ultra': {
    name: 'context-ultra',
    provider: 'xai',
    model: 'grok-4-fast-reasoning',
    description: 'Premium reasoning model'
  }
};

export const MODEL_CHOICES = [
  { name: `${chalk.white('context')} (Fast)`, value: 'context' },
  { name: `${chalk.magenta('context-ultra')} (Premium)`, value: 'context-ultra' }
];

export function getAllModels() {
  return MODELS;
}

// Get models dynamically from registry
export function getAvailableModels() {
  return providerRegistry.getAllModels();
}
