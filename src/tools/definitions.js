/**
 * Context Engine - Tool Definitions
 * Central location for all tool definitions and handlers
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import fs from 'fs';
import path from 'path';
import { toolRegistry, ToolCategories } from './registry.js';
import { executionTools } from './library/execution-tools.js';
import { writeFile, normalizeNewlines } from '../utils/common.js';

/**
 * Register all core tools
 */
export function registerCoreTools() {

  // ============================================================================
  // SHARED TOOLS (Available to both main AI and subagents)
  // ============================================================================

  toolRegistry.register({
    name: 'getFileContent',
    description: 'Get the full content of a specific file from the codebase. Returns an object with success status, filePath, and content. By default, adds line numbers to help with editing.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'The exact path of the file to read (e.g., "src/index.js", "package.json")'
        },
        lineNumbers: {
          type: 'boolean',
          description: 'Whether to include line numbers in the output (default: true). Set to false for raw content.',
          default: true
        }
      },
      required: ['filePath']
    },
    availableTo: ToolCategories.SHARED,
    tags: ['file', 'read'],
    handler: async (parameters, context) => {
      const { filePath, lineNumbers = true } = parameters;
      const { projectContext } = context;

      // Try to find in context first, then fallback to disk
      let content = '';
      const file = projectContext.find(f => f.path === filePath);

      if (file) {
        content = file.content;
      } else {
        try {
          const fullPath = path.join(process.cwd(), filePath);
          if (fs.existsSync(fullPath)) {
            content = fs.readFileSync(fullPath, 'utf8');
          } else {
            return {
              success: false,
              error: `File not found at path "${filePath}".`,
              filePath: filePath
            };
          }
        } catch (error) {
          return {
            success: false,
            error: `Error reading file "${filePath}": ${error.message}`,
            filePath: filePath
          };
        }
      }

      if (lineNumbers) {
        const lines = content.split('\n');
        const numberedContent = lines.map((line, i) => `${i + 1}: ${line}`).join('\n');

        // Track that this file has been read
        if (context.session && context.session.readFiles) {
          context.session.readFiles.add(filePath);
        }

        return {
          success: true,
          filePath: filePath,
          content: numberedContent,
          message: `Read ${lines.length} lines from ${filePath}`
        };
      }

      // Track that this file has been read (even without line numbers)
      if (context.session && context.session.readFiles) {
        context.session.readFiles.add(filePath);
      }

      return {
        success: true,
        filePath: filePath,
        content: content
      };
    }
  });

  toolRegistry.register({
    name: 'readLines',
    description: 'Read a specific range of lines from a file. Useful for examining specific sections of code.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'The exact path of the file to read'
        },
        startLine: {
          type: 'number',
          description: 'The starting line number (1-based)'
        },
        endLine: {
          type: 'number',
          description: 'The ending line number (1-based)'
        }
      },
      required: ['filePath', 'startLine', 'endLine']
    },
    availableTo: ToolCategories.SHARED,
    tags: ['file', 'read'],
    handler: async (parameters, context) => {
      const { filePath, startLine, endLine } = parameters;

      try {
        const fullPath = path.join(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) {
          return { success: false, error: `File not found: ${filePath}` };
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        if (startLine < 1 || endLine > lines.length || startLine > endLine) {
          return { success: false, error: `Invalid line range: ${startLine}-${endLine} (File has ${lines.length} lines)` };
        }

        const selectedLines = lines.slice(startLine - 1, endLine);
        const numberedContent = selectedLines.map((line, i) => `${startLine + i}: ${line}`).join('\n');

        // Track that this file has been read
        if (context.session && context.session.readFiles) {
          context.session.readFiles.add(filePath);
        }

        return {
          success: true,
          filePath,
          content: numberedContent,
          message: `Read lines ${startLine}-${endLine} of ${filePath}`
        };
      } catch (error) {
        return { success: false, error: `Failed to read lines: ${error.message}` };
      }
    }
  });

  toolRegistry.register({
    name: 'replaceLines',
    description: 'Replace a specific range of lines in a file with new content. Use this for precise code edits. CRITICAL: You MUST read the FULL file with getFileContent before using this tool - do not rely on readLines alone.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'The exact path of the file to edit'
        },
        startLine: {
          type: 'number',
          description: 'The starting line number to replace (1-based)'
        },
        endLine: {
          type: 'number',
          description: 'The ending line number to replace (1-based)'
        },
        newContent: {
          type: 'string',
          description: 'The new content to insert in place of the specified lines. Use actual newlines, not \\n escape sequences.'
        },
        isDangerous: {
          type: 'boolean',
          description: 'Set to true if this edit is risky (e.g., changing critical logic, overwriting user customization).'
        },
        dangerousReason: {
          type: 'string',
          description: 'The reason why this action is dangerous (required if isDangerous is true).'
        }
      },
      required: ['filePath', 'startLine', 'endLine', 'newContent']
    },
    availableTo: ToolCategories.SUBAGENT,
    tags: ['file', 'edit'],
    handler: async (parameters, context) => {
      const { filePath, startLine, endLine, newContent } = parameters;

      // Enforce Read-Before-Write - MUST read FULL file, not just lines
      if (context.session && context.session.readFiles && !context.session.readFiles.has(filePath)) {
        return {
          success: false,
          error: `You must read the FULL file with getFileContent before editing it. Reading only specific lines is not sufficient - you need the complete file context to make safe edits.`
        };
      }

      try {
        const fullPath = path.join(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) {
          return { success: false, error: `File not found: ${filePath}` };
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        if (startLine < 1 || endLine > lines.length || startLine > endLine) {
          return { success: false, error: `Invalid line range: ${startLine}-${endLine} (File has ${lines.length} lines)` };
        }

        // Normalize newlines in newContent - convert literal \n to actual newlines
        const normalizedNewContent = normalizeNewlines(newContent);
        const newLines = normalizedNewContent.split('\n');

        // Splice in new content
        // lines array is 0-indexed, so startLine-1 is the index
        // delete count is endLine - startLine + 1
        lines.splice(startLine - 1, endLine - startLine + 1, ...newLines);

        const updatedContent = lines.join('\n');
        fs.writeFileSync(fullPath, updatedContent, 'utf8');

        // Validate the edited file for common errors
        const { validateFileContent } = await import('./library/file-operations.js');
        const validation = validateFileContent(updatedContent, fullPath);

        if (!validation.isValid) {
          // Rollback the change
          fs.writeFileSync(fullPath, content, 'utf8');
          return {
            success: false,
            error: `Edit validation failed. Errors detected:\n${validation.errors.join('\n')}\n\n` +
              `The file has been restored to its original state. Please fix the edit and try again.`
          };
        }
        if (validation.warnings.length > 0) {
          // Don't fail, but the agent should be aware
          console.warn(`⚠️  Warnings in ${filePath}:\n${validation.warnings.join('\n')}`);
        }

        return {
          success: true,
          filePath,
          message: `Successfully replaced lines ${startLine}-${endLine} in ${filePath}`
        };
      } catch (error) {
        return { success: false, error: `Failed to replace lines: ${error.message}` };
      }
    }
  });

  toolRegistry.register({
    name: 'createFile',
    description: 'Create a NEW file with content. Fails if the file already exists.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'The path of the new file to create'
        },
        content: {
          type: 'string',
          description: 'The content to write to the new file. Use actual newlines, not \\n escape sequences.'
        },
        isDangerous: {
          type: 'boolean',
          description: 'Set to true if this creation is risky (e.g., creating a large file).'
        },
        dangerousReason: {
          type: 'string',
          description: 'The reason why this action is dangerous (required if isDangerous is true).'
        }
      },
      required: ['filePath', 'content']
    },
    availableTo: ToolCategories.SUBAGENT,
    tags: ['file', 'create'],
    handler: async (parameters, context) => {
      const { filePath, content } = parameters;
      try {
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
          return { success: false, error: `File already exists: ${filePath}. Use 'rewriteFile' to overwrite it.` };
        }

        // Ensure directory exists
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fullPath, content, 'utf8');

        // Mark as read since we just wrote it
        if (context.session && context.session.readFiles) {
          context.session.readFiles.add(filePath);
        }

        return { success: true, filePath, message: `Successfully created ${filePath}` };
      } catch (error) {
        return { success: false, error: `Failed to create file: ${error.message}` };
      }
    }
  });

  toolRegistry.register({
    name: 'rewriteFile',
    description: 'Completely rewrite a file with new content. Use this for creating new files or major refactors. CRITICAL: You MUST read the FULL file with getFileContent before rewriting it.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'The exact path of the file to rewrite'
        },
        content: {
          type: 'string',
          description: 'The complete new content for the file. Use actual newlines, not \\n escape sequences.'
        },
        isDangerous: {
          type: 'boolean',
          description: 'Set to true if this rewrite is risky (e.g., overwriting a complex file).'
        },
        dangerousReason: {
          type: 'string',
          description: 'The reason why this action is dangerous (required if isDangerous is true).'
        }
      },
      required: ['filePath', 'content']
    },
    availableTo: ToolCategories.SUBAGENT,
    tags: ['file', 'write'],
    handler: async (parameters, context) => {
      const { filePath, content } = parameters;

      // Enforce Read-Before-Write for rewriting existing files
      // (We check existence first to allow creating NEW files with rewriteFile if desired,
      // though createFile is preferred. If file exists, we require a FULL file read.)
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        if (context.session && context.session.readFiles && !context.session.readFiles.has(filePath)) {
          return {
            success: false,
            error: `You must read the FULL file with getFileContent before rewriting it. Reading only specific lines is not sufficient - you need the complete file context to make safe edits.`
          };
        }
      }

      try {
        // Ensure directory exists
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Save original content if file exists (for rollback)
        let originalContent = null;
        if (fs.existsSync(fullPath)) {
          originalContent = fs.readFileSync(fullPath, 'utf8');
        }

        // Normalize newlines - convert literal \n to actual newlines
        const normalizedContent = normalizeNewlines(content);
        fs.writeFileSync(fullPath, normalizedContent, 'utf8');

        // Validate the rewritten file for common errors
        const { validateFileContent } = await import('./library/file-operations.js');
        const validation = validateFileContent(normalizedContent, fullPath);

        if (!validation.isValid) {
          // Rollback to original if it existed
          if (originalContent !== null) {
            fs.writeFileSync(fullPath, originalContent, 'utf8');
          } else {
            // File didn't exist before, delete it
            fs.unlinkSync(fullPath);
          }
          return {
            success: false,
            error: `File validation failed after rewrite. Errors detected:\n${validation.errors.join('\n')}\n\n` +
              `The file has been restored to its original state. Please fix the content and try again.`
          };
        }
        if (validation.warnings.length > 0) {
          console.warn(`⚠️  Warnings in ${filePath}:\n${validation.warnings.join('\n')}`);
        }

        // Mark as read since we just wrote it
        if (context.session && context.session.readFiles) {
          context.session.readFiles.add(filePath);
        }

        return {
          success: true,
          filePath,
          message: `Successfully rewrote ${filePath}`,
          warnings: validation.warnings.length > 0 ? validation.warnings : undefined
        };
      } catch (error) {
        return { success: false, error: `Failed to rewrite file: ${error.message}` };
      }
    }
  });

  toolRegistry.register({
    name: 'removeFile',
    description: 'Delete a file from the filesystem.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'The path of the file to delete'
        },
        isDangerous: {
          type: 'boolean',
          description: 'Set to true if this deletion is risky (e.g., deleting source code).'
        },
        dangerousReason: {
          type: 'string',
          description: 'The reason why this action is dangerous (required if isDangerous is true).'
        }
      },
      required: ['filePath']
    },
    availableTo: ToolCategories.SUBAGENT,
    tags: ['file', 'delete'],
    handler: async (parameters, context) => {
      const { filePath } = parameters;
      try {
        const fullPath = path.join(process.cwd(), filePath);
        if (!fs.existsSync(fullPath)) {
          return { success: false, error: `File not found: ${filePath}` };
        }
        fs.unlinkSync(fullPath);
        return { success: true, message: `Successfully removed ${filePath}` };
      } catch (error) {
        return { success: false, error: `Failed to remove file: ${error.message}` };
      }
    }
  });

  // ============================================================================
  // SUBAGENT-ONLY TOOLS
  // ============================================================================

  toolRegistry.register({
    name: 'readGeneratedFile',
    description: 'Read the content of a file that was previously generated by this subagent. Use this to analyze or review your own generated content.',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'The path of the file to read (must be a file created by this subagent)'
        }
      },
      required: ['filePath']
    },
    availableTo: ToolCategories.SUBAGENT,
    tags: ['file', 'read', 'generated'],
    handler: async (parameters, context) => {
      const { filePath } = parameters;
      const { generatedFiles, spinner, subAgentName } = context;

      try {
        // Check if this file was generated by this subagent
        if (!generatedFiles || !generatedFiles.some(f => f.path === filePath)) {
          return {
            success: false,
            error: `File "${filePath}" was not generated by this subagent. Only files created by this subagent can be read.`
          };
        }

        // Read the file content
        const fullPath = path.join(process.cwd(), filePath);
        const content = fs.readFileSync(fullPath, 'utf8');

        return {
          success: true,
          filePath: filePath,
          content: content,
          message: `Successfully read generated file: ${filePath}`
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to read generated file "${filePath}": ${error.message}`
        };
      }
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

  // No prompt command: rely on natural language messages only

  // ============================================================================
  // EXECUTION TOOLS (Available to both main AI and subagents)
  // ============================================================================

  // Register execution tools for shared access
  executionTools.forEach(tool => {
    toolRegistry.register({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
      availableTo: ToolCategories.SHARED,
      tags: ['execution', 'git', 'github'],
      handler: tool.handler
    });
  });
}

/**
 * Initialize the tool registry with all core tools
 */
export function initializeToolRegistry() {
  registerCoreTools();
}

