/**
 * Provider System - Registry-based
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
      name: 'Grok Beta',
      model: 'grok-beta',
      description: 'Fast and capable model for general tasks'
    },
    {
      name: 'Grok 2 (Latest)',
      model: 'grok-2-latest',
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
