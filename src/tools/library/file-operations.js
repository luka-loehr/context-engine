/**
 * Context Engine - File Operations Tools
 * Tools for reading, writing, and managing files
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import fs from 'fs';
import path from 'path';
import { writeFile } from '../../utils/common.js';

export const fileOperationsTools = [
  {
    name: 'getFileContent',
    category: 'file-operations',
    description: 'Read the full content of a specific file from the project',
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
  },

  {
    name: 'createFile',
    category: 'file-operations',
    description: 'Create or overwrite a file with specified content',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'The path where the file should be created (relative to project root)'
        },
        content: {
          type: 'string',
          description: 'The complete content to write to the file'
        },
        successMessage: {
          type: 'string',
          description: 'A descriptive success message (e.g., "README.md successfully created")'
        }
      },
      required: ['filePath', 'content', 'successMessage']
    },
    handler: async (parameters, context) => {
      const { filePath, content, successMessage } = parameters;
      const { spinner, allowedPaths } = context;

      return writeFile(filePath, content, { spinner, successMessage, allowedPaths });
    }
  },

  {
    name: 'editFile',
    category: 'file-operations',
    description: 'Edit an existing file by replacing specific content',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'The path of the file to edit'
        },
        oldContent: {
          type: 'string',
          description: 'The exact content to replace (must match exactly)'
        },
        newContent: {
          type: 'string',
          description: 'The new content to insert'
        }
      },
      required: ['filePath', 'oldContent', 'newContent']
    },
    handler: async (parameters, context) => {
      const { filePath, oldContent, newContent } = parameters;
      const { allowedPaths, spinner } = context;

      try {
        const fullPath = path.join(process.cwd(), filePath);
        
        // Check path restrictions
        if (allowedPaths && allowedPaths.length > 0) {
          const isAllowed = allowedPaths.some(allowedPath => {
            const allowedFullPath = path.join(process.cwd(), allowedPath);
            return fullPath.startsWith(allowedFullPath);
          });
          
          if (!isAllowed) {
            return {
              success: false,
              error: `Permission denied: Can only edit files in ${allowedPaths.join(', ')}`
            };
          }
        }

        // Read current content
        if (!fs.existsSync(fullPath)) {
          return {
            success: false,
            error: `File not found: ${filePath}`
          };
        }

        const currentContent = fs.readFileSync(fullPath, 'utf8');
        
        // Replace content
        if (!currentContent.includes(oldContent)) {
          return {
            success: false,
            error: 'Old content not found in file. Content must match exactly.'
          };
        }

        const updatedContent = currentContent.replace(oldContent, newContent);
        fs.writeFileSync(fullPath, updatedContent, 'utf8');

        if (spinner && spinner.isSpinning) {
          spinner.text = `Edited ${filePath}`;
        }

        return {
          success: true,
          message: `Successfully edited ${filePath}`,
          filePath: filePath
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to edit file: ${error.message}`
        };
      }
    }
  },

  {
    name: 'deleteFile',
    category: 'file-operations',
    description: 'Delete a file from the project',
    parameters: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'The path of the file to delete'
        }
      },
      required: ['filePath']
    },
    handler: async (parameters, context) => {
      const { filePath } = parameters;
      const { allowedPaths, spinner } = context;

      try {
        const fullPath = path.join(process.cwd(), filePath);
        
        // Check path restrictions
        if (allowedPaths && allowedPaths.length > 0) {
          const isAllowed = allowedPaths.some(allowedPath => {
            const allowedFullPath = path.join(process.cwd(), allowedPath);
            return fullPath.startsWith(allowedFullPath);
          });
          
          if (!isAllowed) {
            return {
              success: false,
              error: `Permission denied: Can only delete files in ${allowedPaths.join(', ')}`
            };
          }
        }

        if (!fs.existsSync(fullPath)) {
          return {
            success: false,
            error: `File not found: ${filePath}`
          };
        }

        fs.unlinkSync(fullPath);

        if (spinner && spinner.isSpinning) {
          spinner.text = `Deleted ${filePath}`;
        }

        return {
          success: true,
          message: `Successfully deleted ${filePath}`,
          filePath: filePath
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to delete file: ${error.message}`
        };
      }
    }
  },

  {
    name: 'listFiles',
    category: 'file-operations',
    description: 'List all files in the project context',
    parameters: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Optional: Filter files by pattern (e.g., "*.js", "src/")'
        }
      }
    },
    handler: async (parameters, context) => {
      const { pattern } = parameters;
      const { projectContext } = context;

      let files = projectContext.map(f => f.path);

      if (pattern) {
        files = files.filter(f => f.includes(pattern.replace('*', '')));
      }

      return {
        success: true,
        files: files,
        count: files.length
      };
    }
  }
];

