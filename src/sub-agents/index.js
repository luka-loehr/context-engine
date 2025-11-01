/**
 * SubAgent System Entry Point
 * Provides access to the registry and initializes all agents
 */

import { registry } from './core/registry.js';

// Import and register all agents
import { agentConfig as agentsMdConfig } from './agents/agents-md.js';
import { agentConfig as readmeMdConfig } from './agents/readme-md.js';

// Register agents
registry.register(agentsMdConfig);
registry.register(readmeMdConfig);

/**
 * Get a subagent instance by ID
 * @param {string} id - Agent ID (e.g., 'agents-md', 'readme-md')
 * @returns {SubAgent}
 */
export function getSubAgent(id) {
  return registry.getAgent(id);
}

/**
 * Get a subagent instance by tool name
 * @param {string} toolName - Tool function name (e.g., 'createAgentsMd')
 * @returns {SubAgent}
 */
export function getSubAgentByToolName(toolName) {
  return registry.getAgentByToolName(toolName);
}

/**
 * Get all tool definitions for AI
 * @returns {Array}
 */
export function getAllSubAgentTools() {
  return registry.getAllToolDefinitions();
}

/**
 * Check if a tool name is a subagent tool
 * @param {string} toolName
 * @returns {boolean}
 */
export function isSubAgentTool(toolName) {
  return registry.isSubAgentTool(toolName);
}

/**
 * Get all registered agent IDs
 * @returns {Array<string>}
 */
export function getAllAgentIds() {
  return registry.getAllAgentIds();
}

// Export the registry for advanced usage
export { registry };

// Export SubAgentManager for concurrent execution
export { SubAgentManager } from './core/manager.js';

// Export base class for creating new agents
export { SubAgent } from './core/base.js';
