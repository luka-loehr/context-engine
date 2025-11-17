/**
 * Execution Tools
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';
import chalk from 'chalk';

const execAsync = promisify(exec);

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

      // Create spinner for command execution
      const localSpinner = ora(`Running: ${chalk.cyan(command)}`).start();

      try {
        const { stdout, stderr } = await execAsync(command, {
          env: { ...process.env, PAGER: 'cat' },
          maxBuffer: 10 * 1024 * 1024 // 10MB
        });

        // Complete spinner asynchronously with random delay (don't block tool return)
        const delay = 500 + Math.random() * 500;
        setTimeout(() => {
          if (localSpinner) {
            localSpinner.succeed(`Ran: ${chalk.cyan(command)}`);
          }
        }, delay);

        return {
          success: true,
          output: stdout.trim() || stderr.trim(),
          command
        };
      } catch (error) {
        // Complete spinner with error
        const delay = 500 + Math.random() * 500;
        setTimeout(() => {
          if (localSpinner) {
            localSpinner.fail(`Failed: ${chalk.cyan(command)}`);
          }
        }, delay);

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
