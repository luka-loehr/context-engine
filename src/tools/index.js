/**
 * Context Engine - Tools Module
 * Exports the tool registry and initializes core tools
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
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

