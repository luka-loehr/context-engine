/**
 * Context Engine - Provider System
 * Registry-based provider management system
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import { providerRegistry } from './registry.js';
import { XAIProvider } from './xai.js';

// Register XAI provider
providerRegistry.register({
  id: 'xai',
  name: 'XAI (Grok)',
  providerClass: XAIProvider,
  models: [
    {
      name: 'Grok 4 Fast Non-Reasoning',
      model: 'grok-4-fast-non-reasoning',
      description: 'Fast and capable model for general tasks'
    },
    {
      name: 'Grok 4 Fast Reasoning',
      model: 'grok-4-fast-reasoning',
      description: 'Most advanced Grok model with enhanced reasoning'
    }
  ],
  envVar: 'XAI_API_KEY',
  configKey: 'xai_api_key'
});

/**
 * Create provider instance (registry-based)
 */
export function createProvider(provider, apiKey, modelId) {
  return providerRegistry.createProvider(provider, apiKey, modelId);
}

/**
 * Get all available models from all providers
 */
export function getAllModels() {
  return providerRegistry.getAllModels();
}

// Export registry for advanced usage
export { providerRegistry };
