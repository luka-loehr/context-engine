/**
 * Git-related terminal utilities
 */

import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

/**
 * Get git status for current directory
 */
export async function getGitStatus() {
  try {
    const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD 2>/dev/null');
    const branch = stdout.trim();
    return branch ? ` git:(${branch})` : '';
  } catch (err) {
    return '';
  }
}
