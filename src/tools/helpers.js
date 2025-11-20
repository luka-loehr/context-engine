/**
 * Tool Registry Helper Functions
 */

import { toolRegistry } from './registry.js';

/**
 * Get all tool definitions for a specific context
 * @param {string} context - 'main' or 'subagent'
 * @param {string} agentId - Optional: Specific agent ID to filter tools for
 * @returns {Array<Object>}
 */
export function getToolsForContext(context, agentId = null) {
  return toolRegistry.getToolsForContext(context, agentId);
}

/**
 * Get all tool definitions for a specific agent
 * @param {string} agentId - Agent ID (e.g., 'agents-md', 'readme-md')
 * @returns {Array<Object>}
 */
export function getToolsForAgent(agentId) {
  return toolRegistry.getToolsForAgent(agentId);
}

/**
 * Execute a tool in a specific context
 * @param {string} toolName - Tool name
 * @param {Object} parameters - Tool parameters
 * @param {string} context - Execution context ('main' or 'subagent')
 * @param {Object} contextData - Additional context data (must include agentId for agent-specific tools)
 * @returns {Promise<any>}
 */
export async function executeToolInContext(toolName, parameters, context, contextData = {}) {
  return await toolRegistry.executeTool(toolName, parameters, context, contextData);
}

/**
 * Check if a tool is available in a context
 * @param {string} toolName - Tool name
 * @param {string} context - Context ('main' or 'subagent')
 * @returns {boolean}
 */
export function isToolAvailable(toolName, context) {
  return toolRegistry.isAvailableIn(toolName, context);
}

