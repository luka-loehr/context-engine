/**
 * Context Engine - Auto-Discovery Agent Registry
 * Automatically discovers and registers agents from the agents directory
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AutoAgentRegistry {
  constructor() {
    this.agents = new Map();
    this.agentsDir = path.join(__dirname, '../agents');
    this.discovered = false;
  }

  /**
   * Discover and load all agents from the agents directory
   */
  async discoverAgents() {
    if (this.discovered) return;

    try {
      const files = fs.readdirSync(this.agentsDir).filter(f => f.endsWith('.js'));

      for (const file of files) {
        try {
          const filePath = path.join(this.agentsDir, file);
          const module = await import(`file://${filePath}`);

          if (module.agentConfig) {
            const config = module.agentConfig;
            if (this.isValidConfig(config)) {
              this.agents.set(config.id, config);
            }
          }
        } catch (error) {
          console.warn(`Failed to load agent ${file}:`, error.message);
        }
      }

      this.discovered = true;
    } catch (error) {
      console.warn('Failed to discover agents:', error.message);
    }
  }

  /**
   * Validate agent configuration
   */
  isValidConfig(config) {
    return config &&
           typeof config.id === 'string' &&
           typeof config.name === 'string' &&
           typeof config.description === 'string' &&
           Array.isArray(config.tools) &&
           typeof config.systemPrompt === 'string' &&
           Array.isArray(config.triggerPhrases);
  }

  /**
   * Get agent by ID
   */
  getAgent(id) {
    return this.agents.get(id) || null;
  }

  /**
   * Get all agents
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }
}

export const autoAgentRegistry = new AutoAgentRegistry();
export { AutoAgentRegistry };
