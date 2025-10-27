import chalk from 'chalk';
import inquirer from 'inquirer';
import { getConfig, setConfig } from '../config/config.js';
import { getAllModels, updateOllamaModels } from '../constants/models.js';
import { promptForProvider, promptForModel, promptForAPIKey, promptForConfirmation } from '../ui/prompts.js';
import { discoverOllamaModels, showOllamaNotInstalledError, showOllamaServiceNotRunningError, showOllamaNoModelsError, showOllamaRecommendation } from '../utils/ollama.js';
import { showSuccess } from '../ui/output.js';

/**
 * Update API key for a provider
 */
async function updateAPIKey() {
  console.log(chalk.blue('\n🔑 Update API Key'));
  
  // Ask which provider
  const provider = await promptForProvider();

  // Ollama doesn't need an API key
  if (provider === 'ollama') {
    console.log(chalk.yellow('\n⚠️  Ollama runs locally and doesn\'t require an API key.'));
    return;
  }

  // Ask for new API key
  const apiKey = await promptForAPIKey(provider);

  // Save the new API key
  const configKey = `${provider}_api_key`;
  setConfig(configKey, apiKey);

  console.log(chalk.green(`\n✅ API key for ${provider} has been updated!`));
}

/**
 * Change model command
 */
export async function changeModel() {
  console.log(chalk.blue('\n🔄 Model & API Key Settings'));
  
  const currentModel = getConfig('selected_model') || 'gpt-5';
  const currentModelInfo = getAllModels()[currentModel] || getAllModels()['gpt-5'];
  
  console.log(chalk.gray(`Current model: ${currentModelInfo.name}\n`));
  
  // Ask what they want to do
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '🔄 Change AI Model', value: 'change_model' },
        { name: '🔑 Update API Key', value: 'update_key' }
      ]
    }
  ]);
  
  if (action === 'update_key') {
    await updateAPIKey();
    return;
  }
  
  // Provider selection
  let provider = await promptForProvider();
  
  // Handle Ollama special case
  let ollamaModels = null;
  if (provider === 'ollama') {
    const ollamaResult = await discoverOllamaModels();
    
    if (ollamaResult.error) {
      // Show appropriate error message
      switch (ollamaResult.error) {
        case 'not_installed':
          showOllamaNotInstalledError();
          break;
        case 'service_not_running':
          showOllamaServiceNotRunningError();
          break;
        case 'no_models':
          showOllamaNoModelsError();
          break;
        default:
          console.log(chalk.red('\n❌ Error accessing Ollama:'), ollamaResult.details || 'Unknown error');
          console.log(chalk.gray('Please check your Ollama installation and try again.'));
      }
      
      // Ask if they want to choose a different provider
      console.log(chalk.yellow('\n🔄 Would you like to choose a different provider instead?'));
      const useOther = await promptForConfirmation('Select a different AI provider?', true);
      
      if (useOther) {
        provider = await promptForProvider();
      } else {
        console.log(chalk.gray('\nReturning to current model. You can try again when Ollama is ready.'));
        return;
      }
    } else {
      // Success - update models
      updateOllamaModels(ollamaResult);
      ollamaModels = ollamaResult;
      showOllamaRecommendation();
    }
  }
  
  // Model selection
  const selectedModel = await promptForModel(provider, ollamaModels);
  
  // Check if we need API key for this provider
  if (provider !== 'ollama' && !getConfig(`${provider}_api_key`)) {
    console.log(chalk.yellow(`\nYou need a ${provider.toUpperCase()} API key for this model.`));
    const apiKey = await promptForAPIKey(provider);
    setConfig(`${provider}_api_key`, apiKey);
  }
  
  // Save configuration
  setConfig('selected_model', selectedModel);
  const modelInfo = getAllModels()[selectedModel];
  
  console.log(chalk.green(`\n✅ Switched to ${modelInfo.name}`));
}

