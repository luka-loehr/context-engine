/**
 * Tool Registry Helper Functions
 */

import { toolRegistry } from './registry.js';

/**
 * Get all tool definitions for a specific context
 * @param {string} context - 'main' or 'subagent'
 * @returns {Array<Object>}
 */
export function getToolsForContext(context) {
  return toolRegistry.getToolsForContext(context);
}

/**
 * Execute a tool in a specific context
 * @param {string} toolName - Tool name
 * @param {Object} parameters - Tool parameters
 * @param {string} context - Execution context ('main' or 'subagent')
 * @param {Object} contextData - Additional context data
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

