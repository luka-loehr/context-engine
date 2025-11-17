/**
 * Context Engine - Provider Registry
 * Modular AI provider management system
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

class ProviderRegistry {
  constructor() {
    this.providers = new Map();
  }

  register(config) {
    const { id, name, providerClass, models, envVar, configKey } = config;
    
    if (!id || !providerClass || !models) {
      throw new Error('Provider registration requires id, providerClass, and models');
    }

    this.providers.set(id, {
      id,
      name: name || id,
      providerClass,
      models: Array.isArray(models) ? models : [models],
      envVar: envVar || `${id.toUpperCase()}_API_KEY`,
      configKey: configKey || `${id}_api_key`
    });
  }

  getProvider(id) {
    return this.providers.get(id);
  }

  createProvider(id, apiKey, modelId) {
    const config = this.providers.get(id);
    if (!config) {
      throw new Error(`Unknown provider: ${id}`);
    }
    return new config.providerClass(apiKey, modelId);
  }

  getAllModels() {
    const models = [];
    for (const provider of this.providers.values()) {
      models.push(...provider.models.map(m => ({
        ...m,
        provider: provider.id
      })));
    }
    return models;
  }

  getApiKey(providerId) {
    const config = this.providers.get(providerId);
    if (!config) return null;
    
    // Check environment variable first, then config
    return process.env[config.envVar] || null;
  }
}

export const providerRegistry = new ProviderRegistry();
export { ProviderRegistry };

