import { XAIProvider } from './xai.js';

/**
 * Factory function to create the appropriate provider
 */
export function createProvider(provider, apiKey, modelId) {
  switch (provider) {
    case 'xai':
      return new XAIProvider(apiKey, modelId);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

