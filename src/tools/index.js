/**
 * Context Engine - Tools Module
 * Simple tool management system
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import { getToolsForMain, getToolsForSubagent, executeTool, getToolByName, getAllTools } from './registry.js';

/**
 * Get tools for a specific context
 * @param {string} context - 'main' or 'subagent'
 */
export function getToolsForContext(context) {
  return context === 'main' ? getToolsForMain() : getToolsForSubagent();
}

/**
 * Get tools for a specific agent (alias for subagent tools)
 */
export function getToolsForAgent() {
  return getToolsForSubagent();
}

/**
 * Execute a tool in context
 */
export async function executeToolInContext(toolName, parameters, context, contextData = {}) {
  return await executeTool(toolName, parameters, contextData);
}

/**
 * Check if tool is available (always true in simplified system)
 */
export function isToolAvailable() {
  return true;
}

/**
 * Get all available tools
 */
export { getAllTools, getToolByName };

