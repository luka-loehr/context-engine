import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { XAIProvider } from './xai.js';
import { GoogleProvider } from './google.js';
import { OllamaProvider } from './ollama.js';

/**
 * Factory function to create the appropriate provider
 */
export function createProvider(provider, apiKey, modelId) {
  switch (provider) {
    case 'openai':
      return new OpenAIProvider(apiKey, modelId);
    case 'anthropic':
      return new AnthropicProvider(apiKey, modelId);
    case 'xai':
      return new XAIProvider(apiKey, modelId);
    case 'google':
      return new GoogleProvider(apiKey, modelId);
    case 'ollama':
      return new OllamaProvider(modelId);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

