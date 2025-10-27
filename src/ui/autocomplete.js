import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Simple input - clean and minimal
 */
export async function autocompleteInput(promptLabel = '>') {
  const { input } = await inquirer.prompt([
    {
      type: 'input',
      name: 'input',
      message: promptLabel,
      prefix: ''
    }
  ]);

  return input;
}

