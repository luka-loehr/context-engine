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
  }

  /**
   * Discover and load all agents from the agents directory
   * @returns {Promise<void>}
   */
  async discoverAgents() {
    try {
      const files = fs.readdirSync(this.agentsDir);
      
      // Filter for .js files (exclude old files during migration)
      const agentFiles = files.filter(file => 
        file.endsWith('.js') && 
        !file.endsWith('-old.js') &&
        !file.endsWith('-new.js') // Temporary during migration
      );

      for (const file of agentFiles) {
        try {
          const filePath = path.join(this.agentsDir, file);
          const module = await import(`file://${filePath}`);
          
          if (module.agentConfig) {
            const config = module.agentConfig;
            
            // Validate agent config
            if (this.validateAgentConfig(config)) {
              this.agents.set(config.id, config);
              // Silent loading - agents are discovered in background
            } else {
              console.warn(`⚠ Invalid agent config in ${file}`);
            }
          }
        } catch (error) {
          console.warn(`⚠ Failed to load agent from ${file}:`, error.message);
        }
      }

      // Agents loaded silently in background
    } catch (error) {
      console.error('Error discovering agents:', error);
    }
  }

  /**
   * Validate agent configuration
   * @param {Object} config - Agent config to validate
   * @returns {boolean} True if valid
   */
  validateAgentConfig(config) {
    const required = ['id', 'name', 'description', 'tools', 'systemPrompt', 'defaultInstructions'];
    
    for (const field of required) {
      if (!config[field]) {
        console.warn(`Agent config missing required field: ${field}`);
        return false;
      }
    }

    // Validate tools is an array
    if (!Array.isArray(config.tools)) {
      console.warn(`Agent config 'tools' must be an array`);
      return false;
    }

    return true;
  }

  /**
   * Get all registered agents
   * @returns {Array} Array of agent configs
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by ID
   * @param {string} id - Agent ID
   * @returns {Object|null} Agent config or null
   */
  getAgent(id) {
    return this.agents.get(id) || null;
  }

  /**
   * Get agents by category
   * @param {string} category - Category name
   * @returns {Array} Agents in the category
   */
  getAgentsByCategory(category) {
    return this.getAllAgents().filter(agent => agent.category === category);
  }

  /**
   * Register a new agent programmatically
   * @param {Object} config - Agent configuration
   * @returns {boolean} True if successful
   */
  registerAgent(config) {
    if (this.validateAgentConfig(config)) {
      this.agents.set(config.id, config);
      return true;
    }
    return false;
  }

  /**
   * Create a new agent file
   * @param {Object} config - Agent configuration
   * @param {string} filename - Optional custom filename
   * @returns {Promise<Object>} Result with success status and filePath
   */
  async createAgentFile(config, filename = null) {
    try {
      // Validate config
      if (!this.validateAgentConfig(config)) {
        return {
          success: false,
          error: 'Invalid agent configuration'
        };
      }

      // Generate filename if not provided
      if (!filename) {
        filename = `${config.id}.js`;
      }

      // Ensure .js extension
      if (!filename.endsWith('.js')) {
        filename += '.js';
      }

      const filePath = path.join(this.agentsDir, filename);

      // Check if file already exists
      if (fs.existsSync(filePath)) {
        return {
          success: false,
          error: `Agent file already exists: ${filename}`
        };
      }

      // Generate agent file content
      const fileContent = this.generateAgentFileContent(config);

      // Write file
      fs.writeFileSync(filePath, fileContent, 'utf8');

      // Register the agent
      this.registerAgent(config);

      return {
        success: true,
        filePath: path.relative(process.cwd(), filePath),
        message: `Agent ${config.name} created successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate agent file content from config
   * @param {Object} config - Agent configuration
   * @returns {string} File content
   */
  generateAgentFileContent(config) {
    return `/**
 * ${config.name}
 * ${config.description}
 */

export const agentConfig = {
  id: '${config.id}',
  name: '${config.name}',
  description: '${config.description}',
  category: '${config.category || 'general'}',
  icon: '${config.icon || '🤖'}',
  
  // Tools this agent can use
  tools: ${JSON.stringify(config.tools, null, 4)},
  
  // System prompt defines the agent's expertise and behavior
  systemPrompt: \`${config.systemPrompt}\`,
  
  // Default instructions (used when user doesn't provide custom instructions)
  defaultInstructions: \`${config.defaultInstructions}\`
};
`;
  }

  /**
   * Update an existing agent file
   * @param {string} agentId - Agent ID to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Result with success status
   */
  async updateAgentFile(agentId, updates) {
    try {
      const agent = this.getAgent(agentId);
      if (!agent) {
        return {
          success: false,
          error: `Agent not found: ${agentId}`
        };
      }

      // Merge updates with existing config
      const updatedConfig = { ...agent, ...updates };

      // Validate updated config
      if (!this.validateAgentConfig(updatedConfig)) {
        return {
          success: false,
          error: 'Invalid configuration after update'
        };
      }

      // Find the agent file
      const files = fs.readdirSync(this.agentsDir);
      const agentFile = files.find(file => {
        const filePath = path.join(this.agentsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        return content.includes(`id: '${agentId}'`);
      });

      if (!agentFile) {
        return {
          success: false,
          error: `Agent file not found for: ${agentId}`
        };
      }

      const filePath = path.join(this.agentsDir, agentFile);

      // Generate new content
      const newContent = this.generateAgentFileContent(updatedConfig);

      // Write updated file
      fs.writeFileSync(filePath, newContent, 'utf8');

      // Update in registry
      this.agents.set(agentId, updatedConfig);

      return {
        success: true,
        filePath: path.relative(process.cwd(), filePath),
        message: `Agent ${updatedConfig.name} updated successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
export const autoAgentRegistry = new AutoAgentRegistry();

// Export class for testing
export { AutoAgentRegistry };

