/**
 * Tool Registry
 * Central registry for all tools available to main AI and subagents
 * Provides access control and modular tool definitions
 */

class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.categories = {
      MAIN: 'main',           // Available to main AI only
      SUBAGENT: 'subagent',   // Available to subagents only
      SHARED: 'shared'        // Available to both
    };
  }

  /**
   * Register a tool
   * @param {Object} config - Tool configuration
   * @param {string} config.name - Tool name
   * @param {string} config.description - Tool description for AI
   * @param {Object} config.parameters - JSON schema for parameters
   * @param {Function} config.handler - Async function to execute the tool
   * @param {string|Array<string>} config.availableTo - 'main', 'subagent', 'shared', or ['main', 'subagent']
   * @param {Array<string>} config.agentIds - Optional: Specific agent IDs that can use this tool (e.g., ['agents-md', 'readme-md'])
   * @param {Array<string>} config.tags - Optional tags for categorization
   */
  register(config) {
    const {
      name,
      description,
      parameters,
      handler,
      availableTo = 'shared',
      agentIds = null,
      tags = []
    } = config;

    if (!name || !description || !handler) {
      throw new Error('Tool registration requires name, description, and handler');
    }

    // Normalize availableTo to array
    const availability = Array.isArray(availableTo) ? availableTo : [availableTo];

    // Validate availability
    const validCategories = Object.values(this.categories);
    for (const category of availability) {
      if (!validCategories.includes(category) && category !== 'shared') {
        throw new Error(`Invalid availability: ${category}. Must be one of: ${validCategories.join(', ')}, shared`);
      }
    }

    // Expand 'shared' to both main and subagent
    const expandedAvailability = availability.includes('shared')
      ? [this.categories.MAIN, this.categories.SUBAGENT]
      : availability;

    // Normalize agentIds to array if provided
    const normalizedAgentIds = agentIds 
      ? (Array.isArray(agentIds) ? agentIds : [agentIds])
      : null;

    this.tools.set(name, {
      name,
      description,
      parameters: parameters || {
        type: 'object',
        properties: {},
        required: []
      },
      handler,
      availableTo: expandedAvailability,
      agentIds: normalizedAgentIds,
      tags
    });
  }

  /**
   * Get tool definition for AI (without handler)
   * @param {string} name - Tool name
   * @returns {Object|null}
   */
  getToolDefinition(name) {
    const tool = this.tools.get(name);
    if (!tool) return null;

    return {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    };
  }

  /**
   * Get all tool definitions for a specific context
   * @param {string} context - 'main' or 'subagent'
   * @param {string} agentId - Optional: Specific agent ID to filter tools for
   * @returns {Array<Object>}
   */
  getToolsForContext(context, agentId = null) {
    const tools = [];
    
    for (const [name, tool] of this.tools.entries()) {
      // Check if tool is available in this context
      if (!tool.availableTo.includes(context)) {
        continue;
      }

      // If agentId is specified, check if tool is agent-specific
      if (agentId && tool.agentIds) {
        // Tool has agent restrictions - only include if this agent is allowed
        if (!tool.agentIds.includes(agentId)) {
          continue;
        }
      } else if (!agentId && tool.agentIds) {
        // Requesting general tools, skip agent-specific ones
        continue;
      }

      tools.push({
        type: 'function',
        function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
        }
      });
    }
    
    return tools;
  }

  /**
   * Get all tool definitions for a specific agent
   * @param {string} agentId - Agent ID (e.g., 'agents-md', 'readme-md')
   * @returns {Array<Object>}
   */
  getToolsForAgent(agentId) {
    return this.getToolsForContext('subagent', agentId);
  }

  /**
   * Execute a tool
   * @param {string} name - Tool name
   * @param {Object} parameters - Tool parameters
   * @param {string} context - Execution context ('main' or 'subagent')
   * @param {Object} contextData - Additional context data (projectContext, session, agentId, etc.)
   * @returns {Promise<any>}
   */
  async executeTool(name, parameters, context, contextData = {}) {
    const tool = this.tools.get(name);
    
    if (!tool) {
      return {
        success: false,
        error: `Unknown tool: ${name}`
      };
    }

    // Check context access permissions
    if (!tool.availableTo.includes(context)) {
      return {
        success: false,
        error: `Tool '${name}' is not available in ${context} context`
      };
    }

    // Check agent-specific access if tool has agent restrictions
    if (tool.agentIds && contextData.agentId) {
      if (!tool.agentIds.includes(contextData.agentId)) {
        return {
          success: false,
          error: `Tool '${name}' is not available to agent '${contextData.agentId}'`
        };
      }
    }

    try {
      // Execute the tool handler
      return await tool.handler(parameters, contextData);
    } catch (error) {
      return {
        success: false,
        error: `Tool execution failed: ${error.message}`
      };
    }
  }

  /**
   * Check if a tool exists
   * @param {string} name - Tool name
   * @returns {boolean}
   */
  hasTool(name) {
    return this.tools.has(name);
  }

  /**
   * Check if a tool is available in a context
   * @param {string} name - Tool name
   * @param {string} context - Context ('main' or 'subagent')
   * @returns {boolean}
   */
  isAvailableIn(name, context) {
    const tool = this.tools.get(name);
    return tool ? tool.availableTo.includes(context) : false;
  }

  /**
   * Get all tool names
   * @returns {Array<string>}
   */
  getAllToolNames() {
    return Array.from(this.tools.keys());
  }

  /**
   * Get tools by tag
   * @param {string} tag - Tag to filter by
   * @returns {Array<Object>}
   */
  getToolsByTag(tag) {
    const tools = [];
    
    for (const [name, tool] of this.tools.entries()) {
      if (tool.tags.includes(tag)) {
        tools.push({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        });
      }
    }
    
    return tools;
  }

  /**
   * Remove a tool from registry
   * @param {string} name - Tool name
   * @returns {boolean}
   */
  unregister(name) {
    return this.tools.delete(name);
  }

  /**
   * Clear all tools (useful for testing)
   */
  clear() {
    this.tools.clear();
  }

  /**
   * Get statistics about registered tools
   * @returns {Object}
   */
  getStats() {
    const stats = {
      total: this.tools.size,
      main: 0,
      subagent: 0,
      shared: 0,
      byTag: {}
    };

    for (const tool of this.tools.values()) {
      if (tool.availableTo.includes('main') && tool.availableTo.includes('subagent')) {
        stats.shared++;
      } else if (tool.availableTo.includes('main')) {
        stats.main++;
      } else if (tool.availableTo.includes('subagent')) {
        stats.subagent++;
      }

      // Count by tags
      for (const tag of tool.tags) {
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
      }
    }

    return stats;
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry();

// Export class for testing
export { ToolRegistry };

// Export categories for easy access
export const ToolCategories = {
  MAIN: 'main',
  SUBAGENT: 'subagent',
  SHARED: 'shared'
};

