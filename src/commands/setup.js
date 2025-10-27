import chalk from 'chalk';
import { setConfig } from '../config/config.js';
import { getAllModels, updateOllamaModels } from '../constants/models.js';
import { promptForProvider, promptForModel, promptForAPIKey, promptForConfirmation } from '../ui/prompts.js';
import { discoverOllamaModels, showOllamaNotInstalledError, showOllamaServiceNotRunningError, showOllamaNoModelsError, showOllamaRecommendation } from '../utils/ollama.js';
import { showSuccess } from '../ui/output.js';

/**
 * Main setup wizard
 */
export async function setupWizard() {
  console.log(chalk.blue('\n🚀 Welcome to promptx!'));
  console.log(chalk.gray('Let\'s set up your AI model preferences.\n'));
  
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
        console.log(chalk.gray('\nExiting setup. You can run promptx again when Ollama is ready.'));
        process.exit(0);
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
  
  // API key setup (skip for Ollama)
  let apiKey = null;
  if (provider !== 'ollama') {
    apiKey = await promptForAPIKey(provider);
    setConfig(`${provider}_api_key`, apiKey);
  }
  
  // Save configuration
  setConfig('selected_model', selectedModel);
  setConfig('setup_complete', true);
  
  const modelInfo = getAllModels()[selectedModel];
  showSuccess('Setup complete!', {
    'Provider': provider.toUpperCase(),
    'Model': modelInfo.name
  });
  console.log(chalk.gray('You can change your model anytime by typing /model\n'));
}

