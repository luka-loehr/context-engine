/**
 * Tool definitions for AI function calling
 */

export const TOOLS = {
  getFileContent: {
    name: 'getFileContent',
    description: 'Get the full content of a specific file from the codebase. Returns an object with success status, filePath, and content (if successful) or error message (if failed). Use this when you need to read or analyze a specific file.',
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
  },
  exit: {
    name: 'exit',
    description: 'Exit the context-engine CLI session. Use this when the user wants to close or quit the interactive chat.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  help: {
    name: 'help',
    description: 'Show context-engine version and tips. Use this when the user asks for help or information about the tool.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  model: {
    name: 'model',
    description: 'Open model selection dialog to change the AI model. Use this when the user wants to switch between available AI models.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  api: {
    name: 'api',
    description: 'Manage API keys - show current status or import from .env file. Use this when the user wants to check or update API key configuration.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  clear: {
    name: 'clear',
    description: 'Clear the conversation history. Use this when the user wants to start fresh or reset the chat context.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  createAgentsMd: {
    name: 'createAgentsMd',
    description: 'Create an AGENTS.md file for the project. This tool spawns a sub-agent that analyzes the codebase and generates comprehensive instructions for AI coding agents. Use this when the user wants to create documentation specifically for AI assistants.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  createReadme: {
    name: 'createReadme',
    description: 'Create a README.md file for the project. This tool spawns a sub-agent that analyzes the codebase and generates a comprehensive README with project description, installation instructions, usage examples, and other relevant information.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  createConcurrentSubagents: {
    name: 'createConcurrentSubagents',
    description: 'Create multiple documentation files concurrently using subagents. Use this when the user wants to create AGENTS.md and README.md at the same time for better efficiency.',
    parameters: {
      type: 'object',
      properties: {
        subagents: {
          type: 'array',
          description: 'Array of subagent names to execute concurrently (e.g., ["agentsMd", "readme"])',
          items: {
            type: 'string',
            enum: ['agentsMd', 'readme']
          }
        }
      },
      required: ['subagents']
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
    case 'exit':
      return {
        success: true,
        action: 'exit',
        message: 'Exiting context-engine session...'
      };
    case 'help':
      return {
        success: true,
        action: 'help'
      };
    case 'model':
      return {
        success: true,
        action: 'model'
      };
    case 'api':
      return {
        success: true,
        action: 'api'
      };
    case 'clear':
      return {
        success: true,
        action: 'clear'
      };
    case 'createAgentsMd':
      return {
        success: true,
        action: 'createAgentsMd'
      };
    case 'createReadme':
      return {
        success: true,
        action: 'createReadme'
      };
    case 'createConcurrentSubagents':
      return {
        success: true,
        action: 'createConcurrentSubagents',
        subagents: parameters.subagents
      };
    default:
      return {
        success: false,
        error: `Unknown tool: ${toolName}`
      };
  }
}

/**
 * Get file content from project context
 */
function getFileContent(filePath, projectContext) {
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

