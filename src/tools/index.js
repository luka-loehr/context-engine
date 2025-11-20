/**
 * Tools Module Entry Point
 * Exports the tool registry and initializes core tools
 */

import { toolRegistry, ToolRegistry, ToolCategories } from './registry.js';
import { initializeToolRegistry } from './definitions.js';

// Initialize all core tools
initializeToolRegistry();

// Export the singleton registry
export { toolRegistry };

// Export for testing
export { ToolRegistry };

// Export categories for convenience
export { ToolCategories };

// Export helper functions
export {
  getToolsForContext,
  getToolsForAgent,
  executeToolInContext,
  isToolAvailable
} from './helpers.js';

