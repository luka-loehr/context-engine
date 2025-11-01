/**
 * Sub-agents registry
 * Exports all available sub-agents
 */

export { SubAgent } from './base.js';
export { AgentsMdSubAgent } from './agents-md.js';

// Import for registry
import { AgentsMdSubAgent } from './agents-md.js';

/**
 * Get a sub-agent by name
 * @param {string} name - Sub-agent name
 * @returns {SubAgent} Sub-agent instance
 */
export function getSubAgent(name) {
  switch (name) {
    case 'agentsMd':
      return new AgentsMdSubAgent();
    default:
      throw new Error(`Unknown sub-agent: ${name}`);
  }
}
