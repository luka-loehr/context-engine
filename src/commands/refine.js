import chalk from 'chalk';
import { scanDirectory } from '../utils/scanner.js';
import { getSystemPrompt, buildProjectContextPrefix } from '../constants/prompts.js';
import { createProvider } from '../providers/index.js';
import { displayError } from '../ui/output.js';

/**
 * Get project context by scanning current directory
 */
export async function getProjectContext(currentDir) {
  try {
    const files = await scanDirectory(currentDir);
    
    if (files.length === 0) {
      return null;
    }
    
    return files;
  } catch (err) {
    console.log(chalk.red('Error scanning project:', err.message));
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

