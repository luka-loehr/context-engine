/**
 * Context Engine - Execution Tools
 * Terminal command execution and system operations
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import { terminalManager } from '../terminal-manager.js';

export const executionTools = [
  {
    name: 'terminal',
    category: 'execution',
    description: 'Execute a terminal command and return the output',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The command to execute'
        }
      },
      required: ['command']
    },
    handler: async (parameters, context) => {
      const { command } = parameters;

      // Delegate to terminal manager for batching and concurrent execution
      return await terminalManager.execute(command);
    }
  }
];
