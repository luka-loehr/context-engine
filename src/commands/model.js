import chalk from 'chalk';
import { getConfig, setConfig } from '../config/config.js';
import { getAllModels, updateOllamaModels } from '../constants/models.js';
import { promptForProvider, promptForModel, promptForAPIKey, promptForConfirmation } from '../ui/prompts.js';
import { discoverOllamaModels, showOllamaNotInstalledError, showOllamaServiceNotRunningError, showOllamaNoModelsError, showOllamaRecommendation } from '../utils/ollama.js';
import { showSuccess } from '../ui/output.js';

/**
 * Change model command
 */
export async function changeModel() {
  console.log(chalk.blue('\n🔄 Change Model'));
  
  const currentModel = getConfig('selected_model') || 'gpt-5';
  const currentModelInfo = getAllModels()[currentModel] || getAllModels()['gpt-5'];
  
  console.log(chalk.gray(`Current model: ${currentModelInfo.name}\n`));
  
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

