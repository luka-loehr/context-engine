/**
 * Context Engine - Git Utilities
 * Git status and repository information utilities
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
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
