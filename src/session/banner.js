/**
 * Context Engine - Session Banner
 * Welcome banner and display utilities for chat sessions
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import chalk from 'chalk';
import { formatTokenCount, countTokens } from '../utils/tokenizer.js';
import { getGitStatus } from '../terminal/index.js';

/**
 * Display welcome banner
 */
export async function showWelcomeBanner(projectContext, contextPrefix) {
  // Show current directory and git status
  console.log(chalk.gray(`${process.cwd()}${await getGitStatus()}\n`));

  // Welcome header
  console.log(chalk.cyan.bold('* Welcome to context-engine!'));
  console.log('');

  // Show project info
  console.log(chalk.gray('cwd: ' + process.cwd()));

  if (projectContext && projectContext.length > 0) {
    // Calculate tokens from what we actually send (file paths + markdown content)
    const totalTokens = countTokens(contextPrefix);
    const formattedTokens = formatTokenCount(totalTokens);
    console.log(chalk.gray(`read: ${projectContext.length} files (${formattedTokens})\n`));
  } else {
    console.log(chalk.yellow('read: 0 files (no project detected)\n'));
  }

  console.log(chalk.cyan('🚀 Smart Context Engine Features:'));
  console.log('');
  console.log(chalk.gray('  • Instant whole-folder structure preload & injection'));
  console.log(chalk.gray('  • AI-powered context retrieval - reads exactly what you need'));
  console.log(chalk.gray('  • Multi-file analysis with intelligent file selection'));
  console.log(chalk.gray('  • Real-time code understanding & bug detection'));
  console.log(chalk.gray('  • Ask anything about your codebase - from architecture to implementation\n'));
}

/**
 * Show features list
 */
export function showFeatures() {
  console.log(chalk.cyan('🚀 Smart Context Engine Features:'));
  console.log('');
  console.log(chalk.gray('  • Instant whole-folder structure preload & injection'));
  console.log(chalk.gray('  • AI-powered context retrieval - reads exactly what you need'));
  console.log(chalk.gray('  • Multi-file analysis with intelligent file selection'));
  console.log(chalk.gray('  • Real-time code understanding & bug detection'));
  console.log(chalk.gray('  • Ask anything about your codebase - from architecture to implementation'));
}

/**
 * Show quick stats
 */
export function showProjectStats(projectContext, contextPrefix) {
  console.log(chalk.gray('cwd: ' + process.cwd()));

  if (projectContext && projectContext.length > 0) {
    const totalTokens = countTokens(contextPrefix);
    const formattedTokens = formatTokenCount(totalTokens);
    console.log(chalk.gray(`read: ${projectContext.length} files (${formattedTokens})`));
  } else {
    console.log(chalk.yellow('read: 0 files (no project detected)'));
  }
}
