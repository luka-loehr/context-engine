/**
 * Context Engine - Common Utilities
 * Reusable utility functions for common patterns
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { taskManager } from '../ui/task-manager.js';

/**
 * Create a random delay between 500-1000ms for smooth UX
 * @returns {number} Random delay in milliseconds
 */
export function getRandomDelay() {
  return 500 + Math.random() * 500;
}

/**
 * Execute operation with spinner feedback
 * @param {string} message - Spinner message
 * @param {Function} operation - Async operation to execute
 * @param {string} successMessage - Success message
 * @returns {Promise} Operation result
 */
export async function withSpinner(message, operation, successMessage = null) {
  const spinner = ora(message).start();

  try {
    const result = await operation(spinner);

    if (spinner.isSpinning) {
      spinner.succeed(successMessage || message.replace('...', ' completed'));
    }

    return result;
  } catch (error) {
    if (spinner.isSpinning) {
      spinner.fail(`${message.replace('...', '')} failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Safely write file with directory creation
 * @param {string} filePath - Relative file path
 * @param {string} content - File content
 * @param {Object} options - Options object
 * @param {Object} options.spinner - Ora spinner instance
 * @param {string} options.successMessage - Success message
 * @param {Array<string>} options.allowedPaths - Array of allowed path prefixes
 * @returns {Object} Result object
 */
export function writeFile(filePath, content, { spinner, successMessage, allowedPaths } = {}) {
  try {
    // Ensure we're writing to the project root
    const fullPath = path.join(process.cwd(), filePath);

    // Check if path restrictions apply
    if (allowedPaths && allowedPaths.length > 0) {
      const isAllowed = allowedPaths.some(allowedPath => {
        const allowedFullPath = path.join(process.cwd(), allowedPath);
        return fullPath.startsWith(allowedFullPath);
      });

      if (!isAllowed) {
        return {
          success: false,
          error: `Permission denied: Can only write to ${allowedPaths.join(', ')}`
        };
      }
    }

    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(fullPath, content, 'utf8');

    // Update spinner if provided
    if (spinner && spinner.isSpinning) {
      spinner.succeed(successMessage || `Created ${filePath}`);
    }

    return {
      success: true,
      message: successMessage || `Created ${filePath}`,
      filePath: filePath
    };
  } catch (error) {
    // Update spinner if provided
    if (spinner && spinner.isSpinning) {
      spinner.fail(`Failed to create ${filePath}: ${error.message}`);
    }
    return {
      success: false,
      error: `Failed to create file: ${error.message}`
    };
  }
}

/**
 * Create a spinner for file reading operations
 * @param {string} fileName - Name of file being read
 * @param {boolean} isMeaningful - Whether the file is meaningful to show spinner
 * @returns {Object|null} Spinner instance or null
 */
export function createFileReadSpinner(fileName, isMeaningful = true) {
  if (!isMeaningful) return null;
  
  // Don't show spinner if tasks are active (tasks will show status updates)
  if (taskManager.hasActiveTasks()) return null;

  const ora = require('ora');
  const chalk = require('chalk');
  return ora(`Reading ${chalk.cyan(fileName)}`).start();
}

/**
 * Complete file read spinner with token count
 * @param {Object} spinner - Ora spinner instance
 * @param {string} fileName - Name of file that was read
 * @param {number} tokenCount - Number of tokens read
 */
export function completeFileReadSpinner(spinner, fileName, tokenCount) {
  if (spinner && spinner.isSpinning) {
    const formatTokenCount = require('./tokenizer.js').formatTokenCount;
    const chalk = require('chalk');
    spinner.succeed(`Read ${chalk.cyan(fileName)} (${formatTokenCount(tokenCount)})`);
  }
}
