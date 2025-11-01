/**
 * Sub-agents registry
 * Exports all available sub-agents
 */

export { SubAgent } from './base.js';
export { AgentsMdSubAgent } from './agents-md.js';
export { ReadmeSubAgent } from './readme-md.js';

// Import for registry
import { AgentsMdSubAgent } from './agents-md.js';
import { ReadmeSubAgent } from './readme-md.js';

/**
 * Get a sub-agent by name
 * @param {string} name - Sub-agent name
 * @returns {SubAgent} Sub-agent instance
 */
export function getSubAgent(name) {
  switch (name) {
    case 'agentsMd':
      return new AgentsMdSubAgent();
    case 'readme':
      return new ReadmeSubAgent();
    default:
      throw new Error(`Unknown sub-agent: ${name}`);
  }
}
