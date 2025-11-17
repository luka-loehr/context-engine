/**
 * Context Engine - UI Prompts
 * User input handling and prompt utilities
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import { autocompleteInput } from './autocomplete.js';

/**
 * Prompt for user input
 */
export async function promptForUserInput(promptLabel = '>') {
  return autocompleteInput(promptLabel);
}

