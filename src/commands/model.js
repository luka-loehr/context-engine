import chalk from 'chalk';
import inquirer from 'inquirer';
import { getConfig, setConfig } from '../config/config.js';
import { getAllModels, MODEL_CHOICES } from '../constants/models.js';
import { colorizeModelName } from '../ui/output.js';

/**
 * Change model command
 */
export async function changeModel() {
  console.log(chalk.blue('\nChange Model'));

  const currentModel = getConfig('selected_model') || 'context';
  const currentModelInfo = getAllModels()[currentModel] || getAllModels()['context'];

  console.log(chalk.gray(`Current model: ${colorizeModelName(currentModelInfo.name)}\n`));

  // Ask which model
  const { selectedModel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedModel',
      message: 'Select a model:',
      choices: MODEL_CHOICES,
      default: currentModel
    }
  ]);

  // Clear the prompt output and header but keep welcome screen
  process.stdout.write('\x1b[2K\r'); // Clear current line
  process.stdout.write('\x1b[1A\x1b[2K\r'); // Move up and clear
  process.stdout.write('\x1b[1A\x1b[2K\r'); // Move up and clear again for the question
  process.stdout.write('\x1b[1A\x1b[2K\r'); // Move up and clear for current model line

  // Save configuration
  setConfig('selected_model', selectedModel);
  const modelInfo = getAllModels()[selectedModel];

  // Replace the "Change Model" header with the success message
  process.stdout.write(`\r${chalk.green(`Switched to ${colorizeModelName(modelInfo.name)}`)}\n`);
}
