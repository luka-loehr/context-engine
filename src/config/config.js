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
export async function getOrSetupConfig(setupWizardFn) {
  const setupComplete = config.get('setup_complete');
  
  if (!setupComplete) {
    await setupWizardFn();
  }
  
  const selectedModel = config.get('selected_model') || 'promptx';
  let modelInfo = getAllModels()[selectedModel];

  // If still not found, fall back to default
  if (!modelInfo) {
    console.log(chalk.yellow(`Model ${selectedModel} not found. Falling back to promptx.`));
    config.set('selected_model', 'promptx');
    modelInfo = getAllModels()['promptx'];
  }

  // Get API key from environment variable
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.log(chalk.red('\n❌ Error: GOOGLE_API_KEY environment variable not set'));
    console.log(chalk.gray('Please set your Google API key:'));
    console.log(chalk.white('\n  export GOOGLE_API_KEY="your-api-key-here"\n'));
    console.log(chalk.gray('Get your API key at: https://aistudio.google.com/apikey\n'));
    process.exit(1);
  }
  
  return { selectedModel, modelInfo, apiKey };
}

export default config;

