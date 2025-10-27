import chalk from 'chalk';
import { promptForProvider, promptForAPIKey } from '../ui/prompts.js';
import { setConfig } from '../config/config.js';

/**
 * Update API key for a specific provider
 */
export async function updateApiKey() {
  console.log(chalk.blue('\n🔑 Update API Key'));
  console.log(chalk.gray('Update your API key without losing other settings\n'));

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
  console.log(chalk.gray('You can continue using promptx with your new key.\n'));
}

