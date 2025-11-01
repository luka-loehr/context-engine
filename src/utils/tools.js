/**
 * Tool definitions for AI function calling
 * DEPRECATED: This file is maintained for backward compatibility
 * New code should use src/tools/index.js and the ToolRegistry
 */

import { toolRegistry } from '../tools/index.js';

// Legacy TOOLS object for backward compatibility
// Tools are now managed by ToolRegistry in src/tools/
export const TOOLS = {
  get getFileContent() {
    return toolRegistry.getToolDefinition('getFileContent');
  },
  get exit() {
    return toolRegistry.getToolDefinition('exit');
  },
  get help() {
    return toolRegistry.getToolDefinition('help');
  },
  get model() {
    return toolRegistry.getToolDefinition('model');
  },
  get api() {
    return toolRegistry.getToolDefinition('api');
  },
  get clear() {
    return toolRegistry.getToolDefinition('clear');
  }
};

/**
 * Execute a tool call (legacy wrapper)
 * @deprecated Use executeToolInContext from src/tools/index.js instead
 */
export function executeTool(toolName, parameters, projectContext) {
  // This is a legacy function that returns action objects for compatibility
  // The actual tool execution happens in chat.js
  
  const actionTools = ['exit', 'help', 'model', 'api', 'clear'];
  
  if (actionTools.includes(toolName)) {
    return {
      success: true,
      action: toolName
    };
  }
  
  // For getFileContent, execute directly
  if (toolName === 'getFileContent') {
    return getFileContentLegacy(parameters.filePath, projectContext);
  }
  
  return {
    success: false,
    error: `Unknown tool: ${toolName}`
  };
}

/**
 * Legacy getFileContent implementation
 * @private
 */
function getFileContentLegacy(filePath, projectContext) {
  const file = projectContext.find(f => f.path === filePath);
  
  if (!file) {
    return {
      success: false,
      error: `File not found at path "${filePath}". Please check the file path and try again.`,
      filePath: filePath
    };
  }
  
  return {
    success: true,
    filePath: file.path,
    content: file.content
  };
}
