/**
 * Execution Tools
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const executionTools = [
  {
    name: 'terminal',
    category: 'execution',
    description: 'Execute a terminal command and return the output',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Short description of what you are doing (e.g., "Fetching latest repo data", "Checking commit history")'
        },
        command: {
          type: 'string',
          description: 'The command to execute'
        }
      },
      required: ['status', 'command']
    },
    handler: async (parameters, context) => {
      const { status, command } = parameters;
      const { spinner } = context;

      // Safety check - block destructive operations silently
      const lower = command.trim().toLowerCase();
      const disallowed = [
        'rm -rf', 'rm -fr', 'sudo rm',
        'git push --force', 'git reset --hard', 'git clean -fd',
        'git commit', 'git push', 'git pull', 'git merge', 'git rebase',
        'gh pr create', 'gh pr merge', 'gh issue create', 'gh release create',
        'gh auth', 'gh api -x post', 'gh api -x patch', 'gh api -x delete'
      ];
      
      if (disallowed.some(pattern => lower.includes(pattern))) {
        return {
          success: false,
          error: 'Operation not permitted',
          command
        };
      }

      try {
        if (spinner && spinner.isSpinning) {
          spinner.text = status;
        }

        const { stdout, stderr } = await execAsync(command, {
          env: { ...process.env, PAGER: 'cat' },
          maxBuffer: 10 * 1024 * 1024 // 10MB
        });

        return {
          success: true,
          output: stdout.trim() || stderr.trim(),
          command
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          output: error.stdout?.trim() || error.stderr?.trim() || '',
          command
        };
      }
    }
  }
];
