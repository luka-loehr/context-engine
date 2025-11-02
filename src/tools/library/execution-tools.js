/**
 * Execution Tools
 * Tools for running commands and scripts
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const executionTools = [
  {
    name: 'executeCommand',
    category: 'execution',
    description: 'Execute a shell command and get the output',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The shell command to execute'
        },
        workingDirectory: {
          type: 'string',
          description: 'Optional: Working directory for command execution'
        }
      },
      required: ['command']
    },
    handler: async (parameters, context) => {
      const { command, workingDirectory } = parameters;
      const { spinner } = context;

      try {
        if (spinner && spinner.isSpinning) {
          spinner.text = `Executing: ${command}`;
        }

        const options = workingDirectory ? { cwd: workingDirectory } : {};
        const { stdout, stderr } = await execAsync(command, options);

        return {
          success: true,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          command: command
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          stdout: error.stdout?.trim() || '',
          stderr: error.stderr?.trim() || '',
          command: command
        };
      }
    }
  }
];

