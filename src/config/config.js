/**
 * Context Engine - Configuration
 * Application configuration management using Conf
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import Conf from 'conf';
import { getAllModels } from '../constants/models.js';
import chalk from 'chalk';

const config = new Conf({ projectName: 'context-engine' });

/**
 * Get configuration value
 */
export function getConfig(key) {
  return config.get(key);
}

/**
 * Set configuration value
 */
export function setConfig(key, value) {
  config.set(key, value);
}

/**
 * Clear all configuration
 */
export function clearConfig() {
  config.clear();
}

/**
 * Check if setup is complete
 */
export function isSetupComplete() {
  return config.get('setup_complete');
}

/**
 * Get or setup configuration
 */
export async function getOrSetupConfig() {
  // Get selected model (defaults to 'context')
  const selectedModel = config.get('selected_model') || 'context';
  let modelInfo = getAllModels()[selectedModel];

  // If model not found, fall back to default
  if (!modelInfo) {
    console.log(chalk.yellow(`Model ${selectedModel} not found. Falling back to context.`));
    config.set('selected_model', 'context');
    modelInfo = getAllModels()['context'];
  }

  // Get API key from config or environment
  let apiKey = config.get('xai_api_key') || process.env.XAI_API_KEY;
  
  return { selectedModel, modelInfo, apiKey };
}

export default config;

