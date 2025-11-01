import { autocompleteInput } from './autocomplete.js';

/**
 * Prompt for user input
 */
export async function promptForUserInput(promptLabel = '>') {
  return autocompleteInput(promptLabel);
}

