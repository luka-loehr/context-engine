/**
 * Context Engine - Base Provider
 * Base provider class for AI model integrations
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */
export class BaseProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Refine a prompt using the provider's AI model
   * @param {string} userPrompt - The input prompt to refine
   * @param {string} systemPrompt - The system prompt
   * @param {Function} onChunk - Callback for streaming chunks
   * @returns {Promise<string>} - The refined prompt
   */
  async refinePrompt(userPrompt, systemPrompt, onChunk) {
    throw new Error('refinePrompt must be implemented by provider');
  }

  /**
   * Get provider-specific configuration
   */
  getConfig() {
    return {};
  }
}

