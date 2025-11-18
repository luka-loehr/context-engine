/**
 * Terminal Manager
 * Manages concurrent terminal command execution with unified UI
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';
import chalk from 'chalk';

const execAsync = promisify(exec);

class TerminalManager {
  constructor() {
    // Track active batch of terminal commands
    this.activeBatch = new Map();
    this.batchId = 0;
    this.currentSpinner = null;
  }

  /**
   * Execute a terminal command with batching support
   * @param {string} command - Command to execute
   * @returns {Promise<Object>} Command result
   */
  async execute(command) {
    // Safety check - block destructive operations
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

    // Create a batch entry for this command
    const callId = ++this.batchId;

    // Create a promise that will be resolved when this call should execute
    let resolveExecution;
    const executionPromise = new Promise(resolve => {
      resolveExecution = resolve;
    });

    // Register this command in the batch
    const callInfo = {
      id: callId,
      command,
      resolveExecution,
      executionPromise
    };
    this.activeBatch.set(callId, callInfo);

    // Let all synchronous tool calls register first
    await Promise.resolve();

    // If we're the first call (coordinator), execute the batch
    if (callId === Math.min(...Array.from(this.activeBatch.keys()))) {
      // Wait a bit for any remaining concurrent calls
      await new Promise(resolve => setTimeout(resolve, 50));

      const allCalls = Array.from(this.activeBatch.values());
      this.activeBatch.clear();

      if (allCalls.length > 1) {
        // Multiple commands - execute concurrently
        await this._executeBatch(allCalls);
      } else {
        // Single command - execute directly with UI
        const cmd = allCalls[0].command;
        const spinner = ora(`Executing: ${chalk.cyan(cmd)}`).start();

        const result = await this._executeCommand(cmd);

        if (result.success) {
          spinner.succeed(`Executed: ${chalk.cyan(cmd)}`);
        } else {
          spinner.fail(`Failed: ${chalk.cyan(cmd)}`);
        }

        allCalls[0].resolveExecution(result);
      }
    }

    // Wait for execution to complete
    return await executionPromise;
  }

  /**
   * Execute a batch of commands concurrently
   * @private
   */
  async _executeBatch(calls) {
    const count = calls.length;
    this.currentSpinner = ora(`Executing ${count} terminal command${count > 1 ? 's' : ''}...`).start();

    try {
      // Execute all commands in parallel
      const results = await Promise.allSettled(
        calls.map(call => this._executeCommand(call.command))
      );

      // Stop spinner
      this.currentSpinner.stop();

      // Display individual results for ALL commands
      results.forEach((result, index) => {
        const cmd = calls[index].command;

        if (result.status === 'fulfilled' && result.value.success) {
          console.log(chalk.green(`✔ Executed: ${chalk.cyan(cmd)}`));
        } else {
          const error = result.status === 'rejected' ? result.reason.message : result.value.error;
          console.log(chalk.red(`✖ Failed: ${chalk.cyan(cmd)}`));
          console.log(chalk.gray(`  ${error}`));
        }
      });

      // Resolve each promise with its result
      results.forEach((result, index) => {
        const value = result.status === 'fulfilled' ? result.value : {
          success: false,
          error: result.reason.message,
          command: calls[index].command
        };
        calls[index].resolveExecution(value);
      });

    } catch (error) {
      this.currentSpinner.fail(`Batch execution failed: ${error.message}`);
      // Resolve all promises with error
      calls.forEach(call => {
        call.resolveExecution({
          success: false,
          error: error.message,
          command: call.command
        });
      });
    }
  }

  /**
   * Execute a single command
   * @private
   */
  async _executeCommand(command) {
    try {
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

// Export singleton instance
export const terminalManager = new TerminalManager();

// Export class for testing
export { TerminalManager };
