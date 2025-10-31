import chalk from 'chalk';
import ora from 'ora';
import { createStreamWriter } from '../utils/stream-writer.js';

/**
 * Colorize model names for display
 */
export function colorizeModelName(modelName) {
  if (modelName === 'promptx-ultra') {
    return chalk.magenta(modelName);
  } else if (modelName === 'promptx') {
    return chalk.white(modelName);
  }
  return modelName; // fallback for any other models
}

/**
 * Display refined prompt output with streaming
 */
export async function displayRefinedPrompt(provider, modelInfo, systemPrompt, messyPrompt, onComplete) {
  const spinner = ora(`Refining your prompt with ${colorizeModelName(modelInfo.name)}...`).start();
  
  try {
    spinner.stop();
    console.log('\n\n' + chalk.gray('─'.repeat(80)));
    console.log(chalk.green('REFINED PROMPT:'));
    console.log(chalk.gray('─'.repeat(80)) + '\n');
    
    const thinkingSpinner = ora(`Refining your prompt with ${colorizeModelName(modelInfo.name)}...`).start();
    const streamWriter = createStreamWriter();
    let firstChunk = true;
    
    const refinedPrompt = await provider.refinePrompt(
      messyPrompt,
      systemPrompt,
      (content) => {
        if (firstChunk) {
          thinkingSpinner.stop();
          firstChunk = false;
        }
        streamWriter.write(content);
      }
    );
    
    streamWriter.flush();
    console.log('\n' + chalk.gray('─'.repeat(80)) + '\n\n');
    
    if (onComplete) {
      onComplete(refinedPrompt);
    }
    
    return refinedPrompt;
  } catch (error) {
    if (spinner.isSpinning) {
      spinner.fail('Failed to refine prompt');
    }
    throw error;
  }
}

/**
 * Show update notification
 */
export function showUpdateNotification(notifier) {
  if (notifier.update) {
    console.log(chalk.yellow('\n╭─────────────────────────────────────────────────────────────╮'));
    console.log(chalk.yellow('│                                                             │'));
    console.log(chalk.yellow('│  ') + chalk.bold.green('Update available! ') + chalk.gray(`${notifier.update.current} → ${notifier.update.latest}`) + chalk.yellow('                      │'));
    console.log(chalk.yellow('│                                                             │'));
    console.log(chalk.yellow('│  ') + chalk.cyan('Run ') + chalk.bold.white('npm install -g @lukaloehr/promptx') + chalk.cyan(' to update') + chalk.yellow('      │'));
    console.log(chalk.yellow('│                                                             │'));
    console.log(chalk.yellow('╰─────────────────────────────────────────────────────────────╯\n'));
  }
}

/**
 * Display error message based on error type
 */
export function displayError(error, modelInfo) {
  if (error.status === 401) {
    console.log(chalk.red('Invalid API key. Please run "promptx reset" to update your API key.'));
  } else if (error.status === 429) {
    console.log(chalk.red('Rate limit exceeded. Please try again later.'));
  } else {
    console.log(chalk.red('Error:', error.message));

    // Provide helpful suggestions
    console.log(chalk.gray('\n💡 Check your API key and account status.'));
  }
}

/**
 * Show success message
 */
export function showSuccess(message, details = {}) {
  console.log(chalk.green(`\n✅ ${message}`));
  Object.entries(details).forEach(([key, value]) => {
    console.log(chalk.gray(`${key}: ${value}`));
  });
}

/**
 * Display project scan results
 */
export function displayProjectScanResults(files) {
  console.log(chalk.gray('\nFiles to include:'));
  files.slice(0, 10).forEach(file => {
    console.log(chalk.gray(`  • ${file.path}`));
  });
  if (files.length > 10) {
    console.log(chalk.gray(`  ... and ${files.length - 10} more files`));
  }
  
  console.log(chalk.yellow('\n⚠️  WARNING: All file contents will be sent to the AI model.'));
  console.log(chalk.gray('This may include sensitive information like API keys or secrets.'));
}

