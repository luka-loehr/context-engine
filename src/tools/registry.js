/**
 * Context Engine - Tool Registry
 * Simple tool management system
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import { fileOperationsTools } from './library/file-operations.js';
import { uiTools } from './library/ui-tools.js';
import { executionTools } from './library/execution-tools.js';

// Categories
export const ToolCategories = {
  MAIN: 'main',
  SUBAGENT: 'subagent',
  SHARED: 'shared'
};

// Tool collections
const allTools = [
  ...fileOperationsTools,
  ...uiTools,
  ...executionTools
];

// Categorize tools
const mainTools = allTools.filter(tool =>
  tool.availableTo?.includes(ToolCategories.MAIN) ||
  tool.availableTo?.includes(ToolCategories.SHARED) ||
  !tool.availableTo
);

const subagentTools = allTools.filter(tool =>
  tool.availableTo?.includes(ToolCategories.SUBAGENT) ||
  tool.availableTo?.includes(ToolCategories.SHARED) ||
  !tool.availableTo
);

/**
 * Get tools for main AI context
 */
export function getToolsForMain() {
  return mainTools.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }
  }));
}

/**
 * Get tools for subagent context
 */
export function getToolsForSubagent() {
  return subagentTools.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }
  }));
}

/**
 * Execute a tool by name
 */
export async function executeTool(name, parameters, context = {}) {
  const tool = allTools.find(t => t.name === name);
  if (!tool) {
    throw new Error(`Tool not found: ${name}`);
  }

  return await tool.handler(parameters, context);
}

/**
 * Get tool by name
 */
export function getToolByName(name) {
  return allTools.find(t => t.name === name) || null;
}

/**
 * Get all available tools
 */
export function getAllTools() {
  return allTools;
}
