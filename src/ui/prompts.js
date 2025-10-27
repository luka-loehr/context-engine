import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';
import { 
  validateOpenAIKey, 
  validateAnthropicKey, 
  validateXAIKey, 
  validateGoogleKey,
  validatePrompt 
} from '../utils/validation.js';
import { PROVIDER_CHOICES, MODEL_CHOICES } from '../constants/models.js';
import chalk from 'chalk';

// Register autocomplete prompt
inquirer.registerPrompt('autocomplete', autocomplete);

/**
 * Prompt for provider selection
 */
export async function promptForProvider() {
  const { provider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Which AI provider would you like to use?',
      choices: PROVIDER_CHOICES
    }
  ]);
  return provider;
}

/**
 * Prompt for model selection based on provider
 */
export async function promptForModel(provider, ollamaModels = null) {
  let modelChoices = MODEL_CHOICES[provider];
  
  // Handle Ollama special case
  if (provider === 'ollama' && ollamaModels) {
    modelChoices = Object.entries(ollamaModels).map(([key, model]) => ({
      name: `${model.name} (${model.fullName})`,
      value: key
    }));
  }
  
  const { selectedModel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedModel',
      message: 'Select your model:',
      choices: modelChoices
    }
  ]);
  
  return selectedModel;
}

/**
 * Prompt for API key based on provider
 */
export async function promptForAPIKey(provider) {
  const prompts = {
    openai: {
      message: 'Enter your OpenAI API key:',
      validate: validateOpenAIKey,
      hint: 'Get one at: https://platform.openai.com/api-keys'
    },
    anthropic: {
      message: 'Enter your Anthropic API key:',
      validate: validateAnthropicKey,
      hint: 'Get one at: https://console.anthropic.com/settings/keys'
    },
    xai: {
      message: 'Enter your xAI API key:',
      validate: validateXAIKey,
      hint: 'Get one at: https://console.x.ai/'
    },
    google: {
      message: 'Enter your Google AI API key:',
      validate: validateGoogleKey,
      hint: 'Get one at: https://aistudio.google.com/apikey'
    }
  };
  
  const config = prompts[provider];
  if (!config) return null;
  
  console.log(`\n${config.hint}\n`);
  
  const { apiKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: config.message,
      validate: config.validate
    }
  ]);
  
  return apiKey;
}

/**
 * Prompt for user input in chat with smart command autocomplete
 */
export async function promptForUserInput(promptLabel = 'You', showHint = false) {
  // Show command hint on first use
  if (showHint) {
    console.log(chalk.gray('💡 Tip: Type /help, /exit, /clear, or /model for commands\n'));
  }
  
  const { prompt } = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'prompt',
      message: `${promptLabel}:`,
      prefix: '',
      suggestOnly: true,
      source: async (answersSoFar, input) => {
        // Only show suggestions if:
        // 1. Input starts with "/"
        // 2. AND there's no space in the input
        if (input && input.startsWith('/') && !input.includes(' ')) {
          const commands = [
            '/help',
            '/exit',
            '/clear',
            '/model'
          ];
          
          // Filter commands that match the input
          const filtered = commands.filter(cmd => 
            cmd.toLowerCase().startsWith(input.toLowerCase())
          );
          
          return filtered.length > 0 ? filtered : [];
        }
        
        // No suggestions for regular text or commands with spaces
        return [];
      },
      validate: validatePrompt
    }
  ]);
  
  return prompt;
}

/**
 * Prompt for confirmation
 */
export async function promptForConfirmation(message, defaultValue = false) {
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: defaultValue
    }
  ]);
  
  return confirmed;
}

/**
 * Prompt for project context confirmation
 */
export async function promptForProjectContext(totalChars) {
  console.log(`Total characters: ~${totalChars.toLocaleString()}`);
  
  return await promptForConfirmation(
    'Do you want to proceed with --pro mode?',
    false
  );
}

