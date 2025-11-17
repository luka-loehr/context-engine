/**
 * Context Engine - UI Autocomplete
 * Terminal input autocomplete functionality
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

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

