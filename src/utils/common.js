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

/**
 * Normalize newlines in content - converts literal \n escape sequences to actual newlines
 * This fixes issues where AI models provide escaped newlines in JSON that need to be converted
 * @param {string} content - Content that may contain literal \n characters
 * @returns {string} Content with normalized newlines
 */
export function normalizeNewlines(content) {
  if (typeof content !== 'string') {
    return content;
  }

  // Replace literal \n (backslash followed by n) with actual newlines
  // This handles cases where JSON.parse didn't properly decode escape sequences
  // or where double-escaping occurred
  return content.replace(/\\n/g, '\n');
}

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
    // Normalize newlines - convert literal \n to actual newlines
    const normalizedContent = normalizeNewlines(content);

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

    // Write the file with normalized content
    fs.writeFileSync(fullPath, normalizedContent, 'utf8');

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
