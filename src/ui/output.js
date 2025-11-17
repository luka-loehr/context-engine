/**
 * Context Engine - UI Output
 * Terminal output formatting and streaming utilities
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import chalk from 'chalk';
import ora from 'ora';
import { createStreamWriter } from '../utils/stream-writer.js';

/**
 * Colorize model names for display
 */
export function colorizeModelName(modelName) {
  if (modelName === 'context-ultra') {
    return chalk.magenta(modelName);
  } else if (modelName === 'context') {
    return chalk.white(modelName);
  }
  return modelName; // fallback for any other models
}

/**
 * Display refined prompt output with streaming
 */
export async function displayRefinedPrompt(provider, modelInfo, systemPrompt, userPrompt, onComplete) {
  const spinner = ora(`Refining your prompt with ${colorizeModelName(modelInfo.name)}...`).start();
  
  try {
    spinner.stop();
    console.log('\n\n' + chalk.gray('─'.repeat(80)));
    console.log(chalk.green('REFINED PROMPT:'));
    console.log(chalk.gray('─'.repeat(80)) + '\n');
    
    const thinkingSpinner = ora(`Refining your prompt with ${colorizeModelName(modelInfo.name)}...`).start();
    const streamWriter = createStreamWriter();
    let firstChunk = true;
    
    const refinedPrompt = await provider.refinePrompt(
      userPrompt,
      systemPrompt,
      (content) => {
        if (firstChunk) {
          thinkingSpinner.stop();
          firstChunk = false;
        }
        streamWriter.write(content);
      }
    );
    
    streamWriter.flush();
    console.log('\n' + chalk.gray('─'.repeat(80)) + '\n\n');
    
    if (onComplete) {
      onComplete(refinedPrompt);
    }
    
    return refinedPrompt;
  } catch (error) {
    if (spinner.isSpinning) {
      spinner.fail('Failed to refine prompt');
    }
    throw error;
  }
}

/**
 * Show update notification
 */
export function showUpdateNotification(notifier) {
  if (notifier.update) {
    console.log(chalk.yellow('\n╭─────────────────────────────────────────────────────────────╮'));
    console.log(chalk.yellow('│                                                             │'));
    console.log(chalk.yellow('│  ') + chalk.bold.green('Update available! ') + chalk.gray(`${notifier.update.current} → ${notifier.update.latest}`) + chalk.yellow('                      │'));
    console.log(chalk.yellow('│                                                             │'));
    console.log(chalk.yellow('│  ') + chalk.cyan('Run ') + chalk.bold.white('npm install -g @lukaloehr/context-engine') + chalk.cyan(' to update') + chalk.yellow('      │'));
    console.log(chalk.yellow('│                                                             │'));
    console.log(chalk.yellow('╰─────────────────────────────────────────────────────────────╯\n'));
  }
}

/**
 * Display error message based on error type
 */
export function displayError(error, modelInfo) {
  if (error.status === 401) {
    console.log(chalk.red('Invalid API key. Please run "context reset" to update your API key.'));
  } else if (error.status === 429) {
    console.log(chalk.red('Rate limit exceeded. Please try again later.'));
  } else {
    console.log(chalk.red('Error:', error.message));

    // Provide helpful suggestions
    console.log(chalk.gray('\n💡 Check your API key and account status.'));
  }
}