import chalk from 'chalk';
import inquirer from 'inquirer';
import { setConfig } from '../config/config.js';
import { MODEL_CHOICES } from '../constants/models.js';

/**
 * Initial setup wizard
 */
export async function setupWizard() {
  console.log(chalk.blue('\n🚀 Welcome to promptx!'));
  console.log(chalk.gray('Let\'s get you set up.\n'));

  // Select model
  const { selectedModel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedModel',
      message: 'Choose your default model:',
      choices: MODEL_CHOICES,
      default: 'promptx'
    }
  ]);

  // Save configuration
  setConfig('selected_model', selectedModel);
  setConfig('setup_complete', true);

  console.log(chalk.green('\n✅ Setup complete!'));
  console.log(chalk.gray('Starting promptx...\n'));
}
