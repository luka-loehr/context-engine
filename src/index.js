import { program } from 'commander';
import updateNotifier from 'update-notifier';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { getOrSetupConfig, clearConfig } from './config/config.js';
import { setupWizard } from './commands/setup.js';
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
    .description('Interactive AI-powered codebase assistant - chat with your code')
    .version(packageJson.version);

  // Reset command
  program
    .command('reset')
    .description('Reset your configuration and API keys')
    .action(async () => {
      clearConfig();
      console.log(chalk.green('Configuration has been reset. You\'ll go through setup next time.'));
    });

  // Main command - interactive chat mode
  program
    .action(async (options) => {
      // Get or setup configuration
      const { selectedModel, modelInfo, apiKey } = await getOrSetupConfig(setupWizard);
      
      // Always scan project context
      console.log(chalk.blue('\n🔍 Scanning project files...'));
      const projectContext = await getProjectContext(process.cwd());
      
      // Start chat session
      await startChatSession(selectedModel, modelInfo, apiKey, projectContext);
    });

  program.parse();
}

