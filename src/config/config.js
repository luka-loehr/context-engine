import Conf from 'conf';
import { getAllModels } from '../constants/models.js';
import chalk from 'chalk';

const config = new Conf({ projectName: 'promptx' });

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
  // Get selected model (defaults to 'promptx')
  const selectedModel = config.get('selected_model') || 'promptx';
  let modelInfo = getAllModels()[selectedModel];

  // If model not found, fall back to default
  if (!modelInfo) {
    console.log(chalk.yellow(`Model ${selectedModel} not found. Falling back to promptx.`));
    config.set('selected_model', 'promptx');
    modelInfo = getAllModels()['promptx'];
  }

  // Get API key from environment based on provider
  let apiKey;
  if (modelInfo.provider === 'xai') {
    apiKey = process.env.XAI_API_KEY;
  } else {
    apiKey = process.env.GOOGLE_API_KEY;
  }
  
  return { selectedModel, modelInfo, apiKey };
}

export default config;

