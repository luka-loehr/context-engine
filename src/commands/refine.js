import ora from 'ora';
import chalk from 'chalk';
import { scanDirectory, getTotalCharacterCount } from '../utils/scanner.js';
import { displayProjectScanResults, displayRefinedPrompt, displayError } from '../ui/output.js';
import { promptForProjectContext } from '../ui/prompts.js';
import { getSystemPrompt, buildProjectContextPrefix } from '../constants/prompts.js';
import { createProvider } from '../providers/index.js';

/**
 * Get project context for --pro mode
 */
export async function getProjectContext(currentDir) {
  const spinner = ora('Scanning project files...').start();
  
  try {
    const files = await scanDirectory(currentDir);
    spinner.succeed(`Found ${files.length} files`);
    
    if (files.length === 0) {
      console.log(chalk.yellow('\nNo valid files found in current directory.'));
      return null;
    }
    
    // Show file list
    displayProjectScanResults(files);
    
    const totalChars = getTotalCharacterCount(files);
    const confirmed = await promptForProjectContext(totalChars);
    
    if (!confirmed) {
      console.log(chalk.gray('Cancelled. Running in normal mode without project context.'));
      return null;
    }
    
    return files;
  } catch (err) {
    spinner.fail('Failed to scan project');
    console.log(chalk.red('Error:', err.message));
    return null;
  }
}

/**
 * Refine prompt command
 */
export async function refinePrompt(messyPrompt, selectedModel, modelInfo, apiKey, projectContext = null) {
  try {
    // Build system prompt
    const systemPrompt = getSystemPrompt(!!projectContext);
    const contextPrefix = buildProjectContextPrefix(projectContext);
    const fullPrompt = contextPrefix + messyPrompt;
    
    // Create provider
    const provider = createProvider(modelInfo.provider, apiKey, selectedModel);
    
    // Display refined prompt with streaming
    const refinedPrompt = await displayRefinedPrompt(
      provider,
      modelInfo,
      systemPrompt,
      fullPrompt
    );
    
    return refinedPrompt;
  } catch (error) {
    displayError(error, modelInfo);
    process.exit(1);
  }
}

