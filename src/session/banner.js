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
  // Clear screen first for a fresh start
  console.clear();

  // Simple text header
  console.log(chalk.cyan.bold('Context Engine v4.0.0'));
  console.log(chalk.gray('AI-Powered Codebase Assistant'));
  console.log('');

  // Prepare project stats
  const cwd = process.cwd();
  const gitStatus = await getGitStatus();
  let fileStats = chalk.yellow('read: 0 files (no project detected)');

  if (projectContext && projectContext.length > 0) {
    const totalTokens = countTokens(contextPrefix);
    const formattedTokens = formatTokenCount(totalTokens);
    fileStats = `Context: ${chalk.white(projectContext.length + ' files')} ${chalk.gray('(' + formattedTokens + ')')}`;
  }

  // Display stats cleanly
  console.log(chalk.gray('Project: ') + chalk.white(cwd));
  console.log(chalk.gray(fileStats));

  if (gitStatus) {
    console.log(chalk.gray('Branch:  ') + chalk.white(gitStatus.replace(' git:(', '').replace(')', '')));
  }

  console.log('');
  console.log(chalk.cyan('Ready to help! ') + chalk.gray('Ask questions or use /help.'));
  console.log('');
}

/**
 * Show features list (kept for help command)
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
