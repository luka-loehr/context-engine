/**
 * Context Engine - CLI Setup
 * Handles Commander.js configuration and command registration
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import { program } from 'commander';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

/**
 * Get package information
 */
function getPackageInfo() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
  );
  return packageJson;
}

/**
 * Setup basic CLI configuration
 */
export function setupCLI() {
  const packageJson = getPackageInfo();

  program
    .name('context')
    .description('Interactive AI-powered codebase assistant using XAI Grok - chat with your code')
    .version(packageJson.version);

  return program;
}

/**
 * Register all CLI commands
 */
export function registerCommands(program, handlers) {
  const {
    clearConfig,
    changeModel,
    getOrSetupConfig,
    getProjectContext,
    startChatSession
  } = handlers;

  // Reset command
  program
    .command('reset')
    .description('Reset your model selection')
    .action(async () => {
      clearConfig();
      console.log('\x1b[32mConfiguration has been reset. Default model will be used next time.\x1b[0m');
    });

  // Model selection command
  program
    .command('model')
    .description('Select a model')
    .action(async () => {
      await changeModel();
    });

  // Test command - single message mode for agent testing
  program
    .command('test')
    .description('Test mode - send a single message and exit (useful for agent testing)')
    .argument('<message>', 'Message to send to the AI')
    .action(async (message) => {
      // Get configuration (no setup needed)
      const { selectedModel, modelInfo, apiKey } = await getOrSetupConfig();

      // Scan project context silently
      const projectContext = await getProjectContext(process.cwd());

      // Start chat session with single message
      await startChatSession(selectedModel, modelInfo, apiKey, projectContext, message);
    });

  // Main command - interactive chat mode
  program
    .action(async (options) => {
      // Get configuration (no setup needed)
      const { selectedModel, modelInfo, apiKey } = await getOrSetupConfig();

      // Scan project context silently
      const projectContext = await getProjectContext(process.cwd());

      // Start chat session
      await startChatSession(selectedModel, modelInfo, apiKey, projectContext);
    });

  return program;
}

/**
 * Parse CLI arguments
 */
export function parseCLI(program) {
  program.parse();
}
