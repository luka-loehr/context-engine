/**
 * Base provider class for AI model integrations
 */
export class BaseProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Refine a prompt using the provider's AI model
   * @param {string} messyPrompt - The input prompt to refine
   * @param {string} systemPrompt - The system prompt
   * @param {Function} onChunk - Callback for streaming chunks
   * @returns {Promise<string>} - The refined prompt
   */
  async refinePrompt(messyPrompt, systemPrompt, onChunk) {
    throw new Error('refinePrompt must be implemented by provider');
  }

  /**
   * Get provider-specific configuration
   */
  getConfig() {
    return {};
  }
}

