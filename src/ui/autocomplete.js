import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Simple input with command hints - no fancy autocomplete
 * Just clean, simple input that works reliably
 */
export async function autocompleteInput(promptLabel = 'You', showHint = false) {
  if (showHint) {
    console.log(chalk.gray('💡 Commands: /help /exit /clear /model\n'));
  }

  const { input } = await inquirer.prompt([
    {
      type: 'input',
      name: 'input',
      message: `${promptLabel}:`,
      prefix: ''
    }
  ]);

  return input;
}

