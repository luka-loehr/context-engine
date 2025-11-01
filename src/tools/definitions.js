/**
 * Tool Definitions
 * Central location for all tool definitions and handlers
 */

import fs from 'fs';
import path from 'path';
import { toolRegistry, ToolCategories } from './registry.js';

/**
 * Register all core tools
 */
export function registerCoreTools() {
  
  // ============================================================================
  // SHARED TOOLS (Available to both main AI and subagents)
  // ============================================================================

  toolRegistry.register({
    name: 'getFileContent',
    description: 'Get the full content of a specific file from the codebase. Returns an object with success status, filePath, and content (if successful) or error message (if failed). Use this when you need to read or analyze a specific file.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'The exact path of the file to read (e.g., "src/index.js", "package.json")'
        }
      },
      required: ['filePath']
    },
    availableTo: ToolCategories.SHARED,
    tags: ['file', 'read'],
    handler: async (parameters, context) => {
      const { filePath } = parameters;
      const { projectContext } = context;
      
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
  });

  // ============================================================================
  // SUBAGENT-ONLY TOOLS
  // ============================================================================

  // Example: Agent-specific tool (only for AGENTS.md subagent)
  toolRegistry.register({
    name: 'analyzeAgentStructure',
    description: 'Analyze the structure of existing AGENTS.md files in the codebase to understand patterns and conventions.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    availableTo: ToolCategories.SUBAGENT,
    agentIds: ['agents-md'], // Only available to agents-md subagent
    tags: ['analysis', 'agents'],
    handler: async (parameters, context) => {
      const { projectContext } = context;
      
      // Find any existing AGENTS.md files
      const agentsFiles = projectContext.filter(f => 
        f.path.toLowerCase().includes('agents.md')
      );
      
      if (agentsFiles.length === 0) {
        return {
          success: true,
          found: false,
          message: 'No existing AGENTS.md files found in project'
        };
      }
      
      // Analyze structure
      const analysis = agentsFiles.map(file => ({
        path: file.path,
        hasProjectOverview: file.content.includes('## Project Overview'),
        hasSetupCommands: file.content.includes('## Setup'),
        hasCodeStyle: file.content.includes('## Code style'),
        lineCount: file.content.split('\n').length
      }));
      
      return {
        success: true,
        found: true,
        files: analysis,
        count: agentsFiles.length
      };
    }
  });

  toolRegistry.register({
    name: 'createFile',
    description: 'Create or overwrite a file with the specified content. Use this when you have completed your analysis and are ready to write the final output.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'The path where the file should be created (e.g., "AGENTS.md", "README.md")'
        },
        content: {
          type: 'string',
          description: 'The complete content to write to the file'
        },
        successMessage: {
          type: 'string',
          description: 'A descriptive success message to show when the file is created (e.g., "AGENTS.md for ProjectName successfully created")'
        }
      },
      required: ['filePath', 'content', 'successMessage']
    },
    availableTo: ToolCategories.SUBAGENT,
    tags: ['file', 'write'],
    handler: async (parameters, context) => {
      const { filePath, content, successMessage } = parameters;
      const { spinner } = context;

      try {
        // Ensure we're writing to the project root
        const fullPath = path.join(process.cwd(), filePath);

        // Write the file
        fs.writeFileSync(fullPath, content, 'utf8');

        // Use the spinner to show success
        if (spinner && spinner.isSpinning) {
          spinner.succeed(successMessage);
        }

        return {
          success: true,
          message: successMessage,
          filePath: filePath
        };
      } catch (error) {
        if (spinner && spinner.isSpinning) {
          spinner.fail(`Failed to create ${filePath}: ${error.message}`);
        }
        return {
          success: false,
          error: `Failed to create file: ${error.message}`
        };
      }
    }
  });

  toolRegistry.register({
    name: 'statusUpdate',
    description: 'Update the status message shown to the user. Use this frequently to keep users informed of progress.',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'A concise status message (1-10 words) describing current activity'
        }
      },
      required: ['status']
    },
    availableTo: ToolCategories.SUBAGENT,
    tags: ['ui', 'status'],
    handler: async (parameters, context) => {
      const { status } = parameters;
      const { spinner, subAgentName } = context;

      // Update the loading spinner with the status message
      if (spinner && spinner.isSpinning) {
        spinner.text = status;
      } else {
        // If spinner is not running, log to console (shouldn't happen in normal flow)
        console.log(`📝 ${subAgentName}: ${status}`);
      }

      return {
        success: true,
        message: `Status updated: ${status}`
      };
    }
  });

  // ============================================================================
  // MAIN AI TOOLS ONLY
  // ============================================================================

  toolRegistry.register({
    name: 'exit',
    description: 'Exit the context-engine CLI session. Use this when the user wants to close or quit the interactive chat.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    availableTo: ToolCategories.MAIN,
    tags: ['system', 'control'],
    handler: async (parameters, context) => {
      return {
        success: true,
        action: 'exit',
        message: 'Exiting context-engine session...'
      };
    }
  });

  toolRegistry.register({
    name: 'help',
    description: 'Show context-engine version and tips. Use this when the user asks for help or information about the tool.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    availableTo: ToolCategories.MAIN,
    tags: ['system', 'info'],
    handler: async (parameters, context) => {
      return {
        success: true,
        action: 'help'
      };
    }
  });

  toolRegistry.register({
    name: 'model',
    description: 'Open model selection dialog to change the AI model. Use this when the user wants to switch between available AI models.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    availableTo: ToolCategories.MAIN,
    tags: ['system', 'config'],
    handler: async (parameters, context) => {
      return {
        success: true,
        action: 'model'
      };
    }
  });

  toolRegistry.register({
    name: 'api',
    description: 'Manage API keys - show current status or import from .env file. Use this when the user wants to check or update API key configuration.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    availableTo: ToolCategories.MAIN,
    tags: ['system', 'config'],
    handler: async (parameters, context) => {
      return {
        success: true,
        action: 'api'
      };
    }
  });

  toolRegistry.register({
    name: 'clear',
    description: 'Clear the conversation history. Use this when the user wants to start fresh or reset the chat context.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    availableTo: ToolCategories.MAIN,
    tags: ['system', 'control'],
    handler: async (parameters, context) => {
      return {
        success: true,
        action: 'clear'
      };
    }
  });
}

/**
 * Initialize the tool registry with all core tools
 */
export function initializeToolRegistry() {
  registerCoreTools();
}

