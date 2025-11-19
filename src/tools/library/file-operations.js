/**
 * Context Engine - File Operations Tools
 * Tools for reading, writing, and managing files
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import fs from 'fs';
import path from 'path';
import { writeFile, normalizeNewlines } from '../../utils/common.js';

/**
 * Escape special regex characters in a string
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validate file content for common errors after edits
 * @param {string} content - File content to validate
 * @param {string} filePath - File path for context
 * @returns {Object} Validation result with warnings/errors
 */
export function validateFileContent(content, filePath) {
  const warnings = [];
  const errors = [];
  const lines = content.split('\n');

  // Check for orphaned return statements (return without function)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('return ') && i > 0) {
      const prevLine = lines[i - 1].trim();
      // Check if previous line doesn't look like a function declaration or opening brace
      if (!prevLine.endsWith('{') && 
          !prevLine.match(/^\s*(if|for|while|switch|try|catch|finally)\s*\(/) &&
          !prevLine.match(/^\s*@override/) &&
          !prevLine.match(/^\s*(async\s+)?\w+\s*\(/)) {
        errors.push(`Line ${i + 1}: Orphaned return statement - missing function declaration`);
      }
    }
  }

  // Check for duplicate method signatures (common in delegate classes)
  const methodSignatures = new Map();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Match method signatures like "bool isSupported(Locale locale)" or "@override bool shouldReload(...)"
    const methodMatch = line.match(/(@override\s+)?(bool|Future|void|String|int|double)\s+(\w+)\s*\(/);
    if (methodMatch) {
      const methodName = methodMatch[3];
      const signature = `${methodName}(${line.match(/\(([^)]*)\)/)?.[1] || ''})`;
      if (methodSignatures.has(signature)) {
        const prevLine = methodSignatures.get(signature);
        errors.push(`Line ${i + 1}: Duplicate method "${methodName}" - already defined at line ${prevLine}`);
      } else {
        methodSignatures.set(signature, i + 1);
      }
    }
  }

  // Check for unmatched braces (basic check)
  let openBraces = 0;
  let openParens = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const char of line) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
      if (char === '(') openParens++;
      if (char === ')') openParens--;
    }
  }
  if (openBraces !== 0) {
    warnings.push(`Unmatched braces detected (${openBraces > 0 ? 'missing' : 'extra'} ${Math.abs(openBraces)} closing braces)`);
  }
  if (openParens !== 0) {
    warnings.push(`Unmatched parentheses detected (${openParens > 0 ? 'missing' : 'extra'} ${Math.abs(openParens)} closing parens)`);
  }

  // Check for duplicate @override annotations on consecutive lines
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].trim() === '@override' && lines[i + 1].trim() === '@override') {
      errors.push(`Lines ${i + 1}-${i + 2}: Duplicate @override annotations`);
    }
  }

  return { warnings, errors, isValid: errors.length === 0 };
}

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
    description: 'Edit an existing file by replacing specific content. CRITICAL: You MUST read the FULL file with getFileContent before editing it.',
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
          description: 'The new content to insert. Use actual newlines, not \\n escape sequences.'
        }
      },
      required: ['filePath', 'oldContent', 'newContent']
    },
    handler: async (parameters, context) => {
      const { filePath, oldContent, newContent } = parameters;
      const { allowedPaths, spinner } = context;

      try {
        const fullPath = path.join(process.cwd(), filePath);
        
        // Enforce Read-Before-Write - MUST read FULL file
        if (context.session && context.session.readFiles && !context.session.readFiles.has(filePath)) {
          return {
            success: false,
            error: `You must read the FULL file with getFileContent before editing it. Reading only specific lines is not sufficient - you need the complete file context to make safe edits.`
          };
        }
        
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
        
        // Find all occurrences and their line numbers
        const allMatches = [];
        let searchPos = 0;
        
        while (true) {
          const pos = currentContent.indexOf(oldContent, searchPos);
          if (pos === -1) break;
          
          // Calculate line number by counting newlines before this position
          const beforeMatch = currentContent.substring(0, pos);
          const lineNum = beforeMatch.split('\n').length;
          
          allMatches.push({ line: lineNum, position: pos });
          searchPos = pos + 1;
          
          // Safety check to prevent infinite loops
          if (searchPos >= currentContent.length) break;
        }
        
        if (allMatches.length === 0) {
          return {
            success: false,
            error: 'Old content not found in file. Content must match exactly (including whitespace and newlines).'
          };
        }

        // If multiple occurrences, provide detailed error with line numbers
        if (allMatches.length > 1) {
          const lineNumbers = allMatches.map(m => m.line).join(', ');
          return {
            success: false,
            error: `Old content appears ${allMatches.length} times in the file at lines: ${lineNumbers}. ` +
                   `CRITICAL: You MUST use replaceLines with specific line numbers for each occurrence, ` +
                   `or make oldContent more specific (include more surrounding context) to match only one occurrence. ` +
                   `Using editFile with ambiguous content will fail.`
          };
        }

        // Normalize newlines in newContent - convert literal \n to actual newlines
        const normalizedNewContent = normalizeNewlines(newContent);
        const updatedContent = currentContent.replace(oldContent, normalizedNewContent);
        
        // Verify the replacement actually happened
        if (updatedContent === currentContent) {
          return {
            success: false,
            error: 'Replacement did not change the file content. Please verify oldContent matches exactly.'
          };
        }
        
        // Verify oldContent is no longer in the file (sanity check)
        if (updatedContent.includes(oldContent)) {
          return {
            success: false,
            error: 'Replacement failed - oldContent still present in file after edit.'
          };
        }
        
        fs.writeFileSync(fullPath, updatedContent, 'utf8');
        
        // Verify file was written correctly
        const verifyContent = fs.readFileSync(fullPath, 'utf8');
        if (verifyContent !== updatedContent) {
          return {
            success: false,
            error: 'File write verification failed - content mismatch after write.'
          };
        }

        // Validate the edited file for common errors
        const validation = validateFileContent(updatedContent, filePath);
        if (!validation.isValid) {
          // Rollback the change
          fs.writeFileSync(fullPath, currentContent, 'utf8');
          return {
            success: false,
            error: `Edit validation failed. Errors detected:\n${validation.errors.join('\n')}\n\n` +
                   `The file has been restored to its original state. Please fix the edit and try again.`
          };
        }
        if (validation.warnings.length > 0) {
          // Don't fail, but warn
          console.warn(`⚠️  Warnings in ${filePath}:\n${validation.warnings.join('\n')}`);
        }

        if (spinner && spinner.isSpinning) {
          spinner.text = `Edited ${filePath}`;
        }

        return {
          success: true,
          message: `Successfully edited ${filePath}`,
          filePath: filePath,
          warnings: validation.warnings.length > 0 ? validation.warnings : undefined
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

