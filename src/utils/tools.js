/**
 * Tool definitions for AI function calling
 */

export const TOOLS = {
  getFileContent: {
    name: 'getFileContent',
    description: 'Get the full content of a specific file from the codebase. Use this when you need to read or analyze a specific file.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'The exact path of the file to read (e.g., "src/index.js", "lib/main.dart")'
        }
      },
      required: ['filePath']
    }
  }
};

/**
 * Execute a tool call
 */
export function executeTool(toolName, parameters, projectContext) {
  switch (toolName) {
    case 'getFileContent':
      return getFileContent(parameters.filePath, projectContext);
    default:
      return `Error: Unknown tool "${toolName}"`;
  }
}

/**
 * Get file content from project context
 */
function getFileContent(filePath, projectContext) {
  const file = projectContext.find(f => f.path === filePath);
  
  if (!file) {
    return `Error: File not found at path "${filePath}". Please check the file path and try again. Use exact paths from the project structure.`;
  }
  
  return `File: ${file.path}\n\nContent:\n${file.content}`;
}

