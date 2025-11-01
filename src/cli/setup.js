/**
 * CLI setup and command definitions
 * Handles Commander.js configuration and command registration
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
