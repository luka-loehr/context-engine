import { program } from 'commander';
import updateNotifier from 'update-notifier';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { getOrSetupConfig, clearConfig } from './config/config.js';
import { changeModel } from './commands/model.js';
import { getProjectContext } from './commands/refine.js';
import { startChatSession } from './commands/chat.js';
import { showHelp } from './commands/help.js';
import { showUpdateNotification } from './ui/output.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

/**
 * Main CLI application
 */
export async function main() {
  // Check for updates
  const notifier = updateNotifier({ 
    pkg: packageJson,
    updateCheckInterval: 1000 * 60 * 60 * 24 // Check once per day
  });
  
  showUpdateNotification(notifier);
  
  // Setup CLI
  program
    .name('promptx')
    .description('Interactive AI-powered codebase assistant using XAI Grok - chat with your code')
    .version(packageJson.version);

  // Reset command
  program
    .command('reset')
    .description('Reset your model selection')
    .action(async () => {
      clearConfig();
      console.log(chalk.green('Configuration has been reset. Default model will be used next time.'));
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

  program.parse();
}

