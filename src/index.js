import { program } from 'commander';
import updateNotifier from 'update-notifier';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { getOrSetupConfig, clearConfig } from './config/config.js';
import { setupWizard } from './commands/setup.js';
import { changeModel } from './commands/model.js';
import { refinePrompt, getProjectContext } from './commands/refine.js';
import { showHelp } from './commands/help.js';
import { promptForUserInput } from './ui/prompts.js';
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
    .description('Transform messy prompts into structured, clear prompts for AI agents')
    .version(packageJson.version);

  // Reset command
  program
    .command('reset')
    .description('Reset your configuration and API keys')
    .action(async () => {
      clearConfig();
      console.log(chalk.green('Configuration has been reset. You\'ll go through setup next time.'));
    });

  // Main command
  program
    .argument('[prompt...]', 'The messy prompt to refine')
    .option('--pro', 'Enable Pro mode with full project context awareness')
    .action(async (promptParts, options) => {
      // Handle special commands
      if (promptParts && promptParts.length === 1) {
        const command = promptParts[0].toLowerCase();
        
        if (command === '/help') {
          showHelp();
          return;
        }
        
        if (command === '/model') {
          await changeModel();
          return;
        }
      }
      
      // Get or setup configuration
      const { selectedModel, modelInfo, apiKey } = await getOrSetupConfig(setupWizard);
      
      // Get project context if --pro mode is enabled
      let projectContext = null;
      if (options.pro) {
        console.log(chalk.blue('\n🚀 Pro Mode Enabled'));
        console.log(chalk.gray('Scanning current directory for project files...\n'));
        projectContext = await getProjectContext(process.cwd());
        
        if (!projectContext) {
          console.log(chalk.gray('Continuing without project context.\n'));
        } else {
          console.log(chalk.green(`\n✅ Project context loaded (${projectContext.length} files)\n`));
        }
      }
      
      // Get prompt
      let messyPrompt;
      
      if (promptParts && promptParts.length > 0) {
        messyPrompt = promptParts.join(' ');
      } else {
        messyPrompt = await promptForUserInput(chalk.gray(modelInfo.name));
        
        // Check for commands in interactive mode
        if (messyPrompt.toLowerCase() === '/help') {
          showHelp();
          return;
        }
        
        if (messyPrompt.toLowerCase() === '/model') {
          await changeModel();
          return;
        }
      }
      
      // Refine the prompt
      await refinePrompt(messyPrompt, selectedModel, modelInfo, apiKey, projectContext);
    });

  program.parse();
}

