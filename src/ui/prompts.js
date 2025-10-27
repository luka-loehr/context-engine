import inquirer from 'inquirer';
import { validatePrompt } from '../utils/validation.js';
import { autocompleteInput } from './autocomplete.js';

/**
 * Prompt for user input with custom autocomplete for commands
 */
export async function promptForUserInput(promptLabel = 'You', showHint = false) {
  return autocompleteInput(promptLabel, showHint);
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
