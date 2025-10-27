import Conf from 'conf';
import { getAllModels } from '../constants/models.js';
import { discoverOllamaModels } from '../utils/ollama.js';
import chalk from 'chalk';
import { updateOllamaModels } from '../constants/models.js';

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
  
  const selectedModel = config.get('selected_model') || 'gpt-5';
  let modelInfo = getAllModels()[selectedModel];

  // If model not found and it might be an Ollama model, try to discover Ollama models
  if (!modelInfo && selectedModel) {
    const ollamaResult = await discoverOllamaModels();
    if (!ollamaResult.error) {
      updateOllamaModels(ollamaResult);
      modelInfo = getAllModels()[selectedModel];
    }
  }

  // If still not found, fall back to default
  if (!modelInfo) {
    console.log(chalk.yellow(`Model ${selectedModel} not found. Falling back to GPT-5.`));
    config.set('selected_model', 'gpt-5');
    modelInfo = getAllModels()['gpt-5'];
  }

  const provider = modelInfo.provider;
  
  let apiKey;
  if (provider === 'ollama') {
    // Ollama doesn't need an API key
    apiKey = null;
  } else if (provider === 'openai') {
    apiKey = config.get('openai_api_key');
    if (!apiKey) {
      console.log(chalk.yellow('OpenAI API key not found. Running setup...'));
      await setupWizardFn();
      apiKey = config.get('openai_api_key');
    }
  } else if (provider === 'anthropic') {
    apiKey = config.get('anthropic_api_key');
    if (!apiKey) {
      console.log(chalk.yellow('Anthropic API key not found. Running setup...'));
      await setupWizardFn();
      apiKey = config.get('anthropic_api_key');
    }
  } else if (provider === 'xai') {
    apiKey = config.get('xai_api_key');
    if (!apiKey) {
      console.log(chalk.yellow('xAI API key not found. Running setup...'));
      await setupWizardFn();
      apiKey = config.get('xai_api_key');
    }
  } else {
    apiKey = config.get('google_api_key');
    if (!apiKey) {
      console.log(chalk.yellow('Google AI API key not found. Running setup...'));
      await setupWizardFn();
      apiKey = config.get('google_api_key');
    }
  }
  
  return { selectedModel, modelInfo, apiKey };
}

export default config;

