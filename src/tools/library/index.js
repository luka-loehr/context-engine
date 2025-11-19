/**
 * Context Engine - Tool Library Index
 * Central registry of all available tools organized by category
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import { fileOperationsTools } from './file-operations.js';
import { uiTools } from './ui-tools.js';
import { executionTools } from './execution-tools.js';
import { statusUpdateTools } from './status-tools.js';

/**
 * All available tools organized by category
 */
export const toolLibrary = {
  'file-operations': fileOperationsTools,
  'ui': uiTools,
  'execution': executionTools,
  'status': statusUpdateTools
};

/**
 * Get all tools as a flat array
 * @returns {Array} All tools
 */
export function getAllTools() {
  const allTools = [];
  for (const category in toolLibrary) {
    allTools.push(...toolLibrary[category]);
  }
  return allTools;
}

/**
 * Get tools by category
 * @param {string} category - Tool category
 * @returns {Array} Tools in the category
 */
export function getToolsByCategory(category) {
  return toolLibrary[category] || [];
}

/**
 * Get a specific tool by name
 * @param {string} name - Tool name
 * @returns {Object|null} Tool definition or null
 */
export function getToolByName(name) {
  const allTools = getAllTools();
  return allTools.find(tool => tool.name === name) || null;
}

/**
 * Get all tool categories
 * @returns {Array} List of category names
 */
export function getToolCategories() {
  return Object.keys(toolLibrary);
}

/**
 * Get tools summary for agent creator
 * Returns simplified list of tools with name, category, and description
 * @returns {Array} Simplified tool list
 */
export function getToolsSummary() {
  const allTools = getAllTools();
  return allTools.map(tool => ({
    name: tool.name,
    category: tool.category,
    description: tool.description
  }));
}

/**
 * Validate tool names against available tools
 * @param {Array<string>} toolNames - Array of tool names to validate
 * @returns {Object} { valid: boolean, invalidTools: Array, validTools: Array }
 */
export function validateToolNames(toolNames) {
  const allTools = getAllTools();
  const availableToolNames = allTools.map(t => t.name);

  const validTools = toolNames.filter(name => availableToolNames.includes(name));
  const invalidTools = toolNames.filter(name => !availableToolNames.includes(name));

  return {
    valid: invalidTools.length === 0,
    validTools,
    invalidTools
  };
}

