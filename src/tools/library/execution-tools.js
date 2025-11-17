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
  ,
  {
    name: 'gitReadOnly',
    category: 'execution',
    description: 'Run allowed read-only git commands and return output',
    parameters: {
      type: 'object',
      properties: {
        args: {
          type: 'string',
          description: 'Git arguments, e.g., "log --oneline -n 10"'
        },
        workingDirectory: {
          type: 'string',
          description: 'Optional working directory'
        }
      },
      required: ['args']
    },
    handler: async (parameters, context) => {
      const { args, workingDirectory } = parameters;
      const { spinner } = context;
      const disallowed = ['commit', 'push', 'pull', 'merge', 'rebase', 'cherry-pick', 'reset', 'checkout', 'stash', 'apply', 'am', 'clean', 'config', 'branch -d', 'branch -D', 'tag -a'];
      const allowedPrefixes = ['log', 'show', 'diff', 'status', 'branch', 'rev-parse', 'remote -v', 'ls-files', 'tag -l'];
      const lower = args.trim().toLowerCase();
      if (disallowed.some(k => lower.includes(k))) {
        return { success: false, error: 'Write or state-changing git command blocked' };
      }
      if (!allowedPrefixes.some(p => lower.startsWith(p))) {
        return { success: false, error: 'Only read-only git commands are permitted' };
      }
      try {
        if (spinner && spinner.isSpinning) spinner.text = `git ${args}`;
        const options = workingDirectory ? { cwd: workingDirectory, env: { ...process.env, PAGER: 'cat' } } : { env: { ...process.env, PAGER: 'cat' } };
        const { stdout, stderr } = await execAsync(`git ${args}`, options);
        return { success: true, stdout: stdout.trim(), stderr: stderr.trim(), command: `git ${args}` };
      } catch (error) {
        return { success: false, error: error.message, stdout: error.stdout?.trim() || '', stderr: error.stderr?.trim() || '' };
      }
    }
  },
  {
    name: 'terminalReadOnly',
    category: 'execution',
    description: 'Execute a read-only terminal command (git/gh only) and return stdout/stderr',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command starting with git or gh' },
        workingDirectory: { type: 'string', description: 'Optional working directory' },
        maxOutput: { type: 'number', description: 'Optional max output length', default: 5000 }
      },
      required: ['command']
    },
    handler: async (parameters, context) => {
      const { command, workingDirectory, maxOutput = 5000 } = parameters;
      const { spinner } = context;
      const lower = command.trim().toLowerCase();
      if (!(lower.startsWith('git ') || lower.startsWith('gh '))) {
        return { success: false, error: 'Only git or gh commands are permitted' };
      }
      const disallowed = [
        'commit', 'push', 'pull', 'merge', 'rebase', 'cherry-pick', 'reset', 'checkout ', 'stash', 'apply', 'am', 'clean', 'config',
        'pr create', 'pr merge', 'issue create', 'release create', 'repo clone', 'repo fork', 'auth login', 'auth refresh',
        'api -x post', 'api -x patch', 'api -x put', 'api -x delete'
      ];
      if (disallowed.some(k => lower.includes(k))) {
        return { success: false, error: 'State-changing or write operation blocked' };
      }
      try {
        if (spinner && spinner.isSpinning) spinner.text = `Executing: ${command}`;
        const options = workingDirectory ? { cwd: workingDirectory, env: { ...process.env, PAGER: 'cat' } } : { env: { ...process.env, PAGER: 'cat' } };
        const { stdout, stderr } = await execAsync(command, options);
        const out = (stdout || '').trim();
        const err = (stderr || '').trim();
        const clippedOut = out.length > maxOutput ? out.slice(0, maxOutput) + '\n... (truncated)' : out;
        const clippedErr = err.length > maxOutput ? err.slice(0, maxOutput) + '\n... (truncated)' : err;
        return {
          success: true,
          command,
          stdout: clippedOut,
          stderr: clippedErr,
          message: (clippedOut || clippedErr) ? `Output for: ${command}\n${clippedOut || clippedErr}` : `No output for: ${command}`
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },
  {
    name: 'ghReadOnly',
    category: 'execution',
    description: 'Run allowed read-only GitHub CLI commands and return output',
    parameters: {
      type: 'object',
      properties: {
        args: {
          type: 'string',
          description: 'gh arguments, e.g., "pr list" or "repo view"'
        },
        workingDirectory: {
          type: 'string',
          description: 'Optional working directory'
        }
      },
      required: ['args']
    },
    handler: async (parameters, context) => {
      const { args, workingDirectory } = parameters;
      const { spinner } = context;
      const disallowed = ['pr create', 'pr merge', 'issue create', 'release create', 'repo clone', 'repo fork', 'auth login', 'auth refresh', 'api -X POST', 'api -X PATCH', 'api -X PUT', 'api -X DELETE'];
      const allowedPrefixes = ['repo view', 'pr list', 'pr view', 'issue list', 'issue view', 'release list', 'release view'];
      const lower = args.trim().toLowerCase();
      if (disallowed.some(k => lower.includes(k))) {
        return { success: false, error: 'Write or state-changing gh command blocked' };
      }
      if (!allowedPrefixes.some(p => lower.startsWith(p))) {
        return { success: false, error: 'Only read-only gh commands are permitted' };
      }
      try {
        if (spinner && spinner.isSpinning) spinner.text = `gh ${args}`;
        const options = workingDirectory ? { cwd: workingDirectory, env: { ...process.env, PAGER: 'cat' } } : { env: { ...process.env, PAGER: 'cat' } };
        const { stdout, stderr } = await execAsync(`gh ${args}`, options);
        return { success: true, stdout: stdout.trim(), stderr: stderr.trim(), command: `gh ${args}` };
      } catch (error) {
        return { success: false, error: error.message, stdout: error.stdout?.trim() || '', stderr: error.stderr?.trim() || '' };
      }
    }
  },
  {
    name: 'diffBranches',
    category: 'execution',
    description: 'Compare two branches and list changed files with statuses',
    parameters: {
      type: 'object',
      properties: {
        base: { type: 'string', description: 'Base branch' },
        compare: { type: 'string', description: 'Compare branch' },
        workingDirectory: { type: 'string', description: 'Optional working directory' }
      },
      required: ['base', 'compare']
    },
    handler: async (parameters, context) => {
      const { base, compare, workingDirectory } = parameters;
      const { spinner } = context;
      try {
        if (spinner && spinner.isSpinning) spinner.text = `git diff --name-status ${base}..${compare}`;
        const options = workingDirectory ? { cwd: workingDirectory, env: { ...process.env, PAGER: 'cat' } } : { env: { ...process.env, PAGER: 'cat' } };
        const { stdout, stderr } = await execAsync(`git diff --name-status ${base}..${compare}`, options);
        const { stdout: logOut } = await execAsync(`git log --oneline ${base}..${compare}`, options);
        return { success: true, files: stdout.trim(), commits: logOut.trim(), stderr: stderr?.trim() || '' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },
  {
    name: 'compareBranches',
    category: 'execution',
    description: 'Compare branches with stats and summaries',
    parameters: {
      type: 'object',
      properties: {
        base: { type: 'string', description: 'Base branch' },
        compare: { type: 'string', description: 'Compare branch' },
        workingDirectory: { type: 'string', description: 'Optional working directory' }
      },
      required: ['base', 'compare']
    },
    handler: async (parameters, context) => {
      const { base, compare, workingDirectory } = parameters;
      const { spinner } = context;
      try {
        if (spinner && spinner.isSpinning) spinner.text = `git diff --stat ${base}..${compare}`;
        const options = workingDirectory ? { cwd: workingDirectory, env: { ...process.env, PAGER: 'cat' } } : { env: { ...process.env, PAGER: 'cat' } };
        const { stdout, stderr } = await execAsync(`git diff --stat ${base}..${compare}`, options);
        const { stdout: short } = await execAsync(`git diff --shortstat ${base}..${compare}`, options);
        return { success: true, stat: stdout.trim(), shortstat: short.trim(), stderr: stderr?.trim() || '' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  }
];
