/**
 * Context Engine - SubAgent System
 * Auto-discovers and provides access to all agents
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

export { autoAgentRegistry } from './core/auto-registry.js';
export { genericAgentExecutor } from './core/generic-executor.js';

// Initialize and discover agents on module load
import { autoAgentRegistry } from './core/auto-registry.js';

// Auto-discover all agents from the agents directory
await autoAgentRegistry.discoverAgents();

// Export helper functions for backwards compatibility
export function getSubAgentByToolName(toolName) {
  // Legacy tool name mapping
  const toolToAgentMap = {
    'createReadme': 'readme-md',
    'createAgentsMd': 'agents-md'
  };
  
  const agentId = toolToAgentMap[toolName];
  return agentId ? autoAgentRegistry.getAgent(agentId) : null;
}

export function isSubAgentTool(toolName) {
  // Check if it's a legacy tool name or starts with create/run
  return toolName.startsWith('create') || toolName.startsWith('run') || toolName.includes('Agent');
}

export function getAllSubAgentTools() {
  // Return tool definitions for all discovered agents
  const agents = autoAgentRegistry.getAllAgents();
  
  return agents.map(agent => ({
    type: 'function',
    function: {
      name: `run_${agent.id.replace(/-/g, '_')}`,
      description: agent.description,
      parameters: {
        type: 'object',
        properties: {
          customInstructions: {
            type: 'string',
            description: 'Optional custom instructions to modify agent behavior'
          }
        }
      }
    }
  }));
}

// Export SubAgentManager for backwards compatibility
export { SubAgentManager } from './core/manager.js';
