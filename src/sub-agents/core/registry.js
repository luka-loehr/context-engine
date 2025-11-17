/**
 * Context Engine - SubAgent Registry
 * Central registry for all available sub-agents with automatic discovery
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SubAgentRegistry {
  constructor() {
    this.agents = new Map();
    this.toolDefinitions = new Map();
  }

  /**
   * Register a subagent
   * @param {Object} config - Agent configuration
   * @param {string} config.name - Display name (e.g., "AGENTS.md")
   * @param {string} config.id - Unique identifier (e.g., "agents-md")
   * @param {string} config.toolName - Tool function name (e.g., "createAgentsMd")
   * @param {string} config.description - Description for AI tool usage
   * @param {Class} config.agentClass - The SubAgent class
   */
  register(config) {
    const { name, id, toolName, description, agentClass } = config;
    
    if (!name || !id || !toolName || !agentClass) {
      throw new Error('SubAgent registration requires name, id, toolName, and agentClass');
    }

    // Store agent configuration
    this.agents.set(id, {
      name,
      id,
      toolName,
      description: description || `Create a ${name} file for the project.`,
      agentClass
    });

    // Generate tool definition
    this.toolDefinitions.set(toolName, {
      name: toolName,
      description: description || `Create a ${name} file for the project. This tool spawns a sub-agent that analyzes the codebase and generates comprehensive documentation.`,
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    });
  }

  /**
   * Get a subagent instance by ID
   * @param {string} id - Agent ID
   * @returns {SubAgent} Instance of the subagent
   */
  getAgent(id) {
    const config = this.agents.get(id);
    if (!config) {
      throw new Error(`SubAgent not found: ${id}`);
    }
    return new config.agentClass();
  }

  /**
   * Get a subagent instance by tool name
   * @param {string} toolName - Tool function name
   * @returns {SubAgent} Instance of the subagent
   */
  getAgentByToolName(toolName) {
    for (const [id, config] of this.agents.entries()) {
      if (config.toolName === toolName) {
        return new config.agentClass();
      }
    }
    throw new Error(`SubAgent not found for tool: ${toolName}`);
  }

  /**
   * Get all tool definitions for AI
   * @returns {Array} Array of tool definition objects
   */
  getAllToolDefinitions() {
    return Array.from(this.toolDefinitions.values());
  }

  /**
   * Check if a tool name is a subagent tool
   * @param {string} toolName - Tool function name
   * @returns {boolean}
   */
  isSubAgentTool(toolName) {
    return this.toolDefinitions.has(toolName);
  }

  /**
   * Get all registered agent IDs
   * @returns {Array<string>}
   */
  getAllAgentIds() {
    return Array.from(this.agents.keys());
  }

  /**
   * Get agent configuration by ID
   * @param {string} id - Agent ID
   * @returns {Object|null}
   */
  getAgentConfig(id) {
    return this.agents.get(id) || null;
  }

  /**
   * Auto-discover and register all agents in the agents directory
   */
  async autoDiscoverAgents() {
    const agentsDir = path.join(__dirname, '../agents');
    
    try {
      const files = fs.readdirSync(agentsDir);
      
      for (const file of files) {
        if (file.endsWith('.js') && !file.startsWith('.')) {
          try {
            const agentPath = path.join(agentsDir, file);
            const module = await import(`file://${agentPath}`);
            
            // Look for exported agent config
            if (module.agentConfig) {
              this.register(module.agentConfig);
            }
          } catch (error) {
            console.warn(`Warning: Could not load subagent from ${file}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      // Agents directory might not exist yet
      console.warn('No agents directory found for auto-discovery');
    }
  }

  /**
   * Clear all registered agents (useful for testing)
   */
  clear() {
    this.agents.clear();
    this.toolDefinitions.clear();
  }
}

// Export singleton instance
export const registry = new SubAgentRegistry();

// Export class for testing
export { SubAgentRegistry };

