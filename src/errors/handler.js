/**
 * Centralized error handling utilities
 */

import chalk from 'chalk';

/**
 * Error types and their handling
 */
const ERROR_TYPES = {
  API_KEY_INVALID: 'api_key_invalid',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  NETWORK_ERROR: 'network_error',
  CONFIG_ERROR: 'config_error',
  FILE_NOT_FOUND: 'file_not_found',
  UNKNOWN_ERROR: 'unknown_error'
};

/**
 * Handle API errors based on status code
 */
export function handleAPIError(error, modelInfo) {
  if (error.status === 401) {
    console.log(chalk.red('Invalid API key. Please run "context reset" to update your API key.'));
    return ERROR_TYPES.API_KEY_INVALID;
  } else if (error.status === 429) {
    console.log(chalk.red('Rate limit exceeded. Please try again later.'));
    return ERROR_TYPES.RATE_LIMIT_EXCEEDED;
  } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    console.log(chalk.red('Network connection failed. Please check your internet connection.'));
    return ERROR_TYPES.NETWORK_ERROR;
  } else {
    console.log(chalk.red('Error:', error.message));
    // Provide helpful suggestions
    console.log(chalk.gray('\n💡 Check your API key and account status.'));
    return ERROR_TYPES.UNKNOWN_ERROR;
  }
}

/**
 * Handle configuration errors
 */
export function handleConfigError(error, context = '') {
  console.log(chalk.red(`Configuration error${context ? ` (${context})` : ''}: ${error.message}`));
  console.log(chalk.gray('Try running "context reset" to reset your configuration.'));
  return ERROR_TYPES.CONFIG_ERROR;
}

/**
 * Handle file system errors
 */
export function handleFileError(error, filePath = '') {
  if (error.code === 'ENOENT') {
    console.log(chalk.red(`File not found: ${filePath || 'unknown file'}`));
    return ERROR_TYPES.FILE_NOT_FOUND;
  } else {
    console.log(chalk.red(`File error${filePath ? ` (${filePath})` : ''}: ${error.message}`));
    return ERROR_TYPES.UNKNOWN_ERROR;
  }
}

/**
 * Handle general application errors
 */
export function handleApplicationError(error, context = 'Application') {
  console.log(chalk.red(`${context} error: ${error.message}`));
  if (error.stack && process.env.DEBUG) {
    console.log(chalk.gray('Stack trace:'));
    console.log(chalk.gray(error.stack));
  }
  return ERROR_TYPES.UNKNOWN_ERROR;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(type, message, details = {}) {
  return {
    success: false,
    error: {
      type,
      message,
      details,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse(data = {}, message = '') {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
}
