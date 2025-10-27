import inquirer from 'inquirer';
import { validatePrompt } from '../utils/validation.js';
import { autocompleteInput } from './autocomplete.js';

/**
 * Prompt for user input
 */
export async function promptForUserInput(promptLabel = '>') {
  return autocompleteInput(promptLabel);
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
