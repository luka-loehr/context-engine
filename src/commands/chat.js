import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { promisify } from 'util';
import { exec } from 'child_process';
import { promptForUserInput } from '../ui/prompts.js';
import { createProvider } from '../providers/index.js';
import { getSystemPrompt, buildProjectContextPrefix } from '../constants/prompts.js';
import { createStreamWriter } from '../utils/stream-writer.js';
import { displayError } from '../ui/output.js';
import { calculateTokens, formatTokenCount, countTokens } from '../utils/tokenizer.js';
import { changeModel } from './model.js';
import { getConfig } from '../config/config.js';
import { getAllModels } from '../constants/models.js';
import { clearLines } from '../ui/screen.js';

const execAsync = promisify(exec);

/**
 * Get git status for current directory
 */
async function getGitStatus() {
  try {
    const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD 2>/dev/null');
    const branch = stdout.trim();
    return branch ? ` git:(${branch})` : '';
  } catch (err) {
    return '';
  }
}

/**
 * Display welcome banner
 */
async function showWelcomeBanner(projectContext) {
  // Show current directory and git status
  console.log(chalk.gray(`${process.cwd()}${await getGitStatus()}\n`));
  
  // Welcome header
  console.log(chalk.cyan.bold('* Welcome to promptx!'));
  console.log('');
  console.log(chalk.gray('  /help for help, /model for models\n'));
  
  // Show project info
  console.log(chalk.gray('cwd: ' + process.cwd()));
  
  if (projectContext && projectContext.length > 0) {
    const totalTokens = calculateTokens(projectContext);
    const formattedTokens = formatTokenCount(totalTokens);
    console.log(chalk.gray(`loaded: ${projectContext.length} files (${formattedTokens})\n`));
  } else {
    console.log(chalk.yellow('loaded: 0 files (no project detected)\n'));
  }
  
  console.log(chalk.gray('Tips for getting started:'));
  console.log('');
  console.log(chalk.gray('  1. Ask me anything about your codebase'));
  console.log(chalk.gray('  2. I can help you understand code, find bugs, or implement features'));
  console.log(chalk.gray('  3. I maintain context, so feel free to ask follow-up questions\n'));
}

/**
 * Start interactive chat session with codebase context
 */
export async function startChatSession(selectedModel, modelInfo, apiKey, projectContext) {
  // Show welcome banner
  await showWelcomeBanner(projectContext);
  
  // Build system prompt with project context
  const systemPrompt = getSystemPrompt();
  const contextPrefix = buildProjectContextPrefix(projectContext);
  
  // Conversation history
  const conversationHistory = [];
  const initialContextMessages = []; // Store initial context separately
  
  // Token tracking
  let currentModel = selectedModel;
  let currentModelInfo = modelInfo;
  let currentApiKey = apiKey;
  const baseTokens = calculateTokens(projectContext) + countTokens(systemPrompt);
  let conversationTokens = 0;
  
  // Track lines to clear before next message
  let linesToClearBeforeNextMessage = 0;
  
  // Create provider (use the actual Gemini model name)
  let provider = createProvider(currentModelInfo.provider, currentApiKey, currentModelInfo.model);
  
  // Helper function to inject context into AI
  async function injectContext() {
    if (!projectContext || projectContext.length === 0) return;
    
    const contextSpinner = ora('Injecting context into AI model...').start();
    
    try {
      const initialContextMessage = contextPrefix + '\n\nPlease respond with just "ready" when you have processed all the project files and are ready to answer questions.';
      
      const acknowledgment = await provider.refinePrompt(
        initialContextMessage,
        systemPrompt,
        null // No streaming for this initial message
      );
      
      contextSpinner.succeed('Context loaded');
      
      // Store initial context messages
      initialContextMessages.length = 0;
      initialContextMessages.push({
        role: 'user',
        content: contextPrefix
      });
      initialContextMessages.push({
        role: 'assistant',
        content: acknowledgment
      });
      
      // Add to conversation history
      conversationHistory.length = 0;
      conversationHistory.push(...initialContextMessages);
      
      console.log('');
    } catch (error) {
      contextSpinner.fail('Failed to load context');
      displayError(error, modelInfo);
      console.log(chalk.yellow('\nContinuing without context...\n'));
    }
  }
  
  // Send initial context to AI ONCE
  await injectContext();
  
  // Chat loop
  while (true) {
    try {
      // Get user input
      const userMessage = await promptForUserInput('>');
      
      // Handle commands
      if (userMessage.toLowerCase() === '/exit') {
        console.log(chalk.gray('\n👋 Goodbye!\n'));
        break;
      }
      
      if (userMessage.toLowerCase() === '/help') {
        showChatHelp();
        continue;
      }
      
      if (userMessage.toLowerCase() === '/clear') {
        // Keep initial context, clear user conversation
        conversationHistory.length = 0;
        conversationHistory.push(...initialContextMessages);
        conversationTokens = 0;
        console.clear();
        await showWelcomeBanner(projectContext);
        console.log(chalk.green('✓ Conversation history cleared (context preserved)\n'));
        linesToClearBeforeNextMessage = 2; // Clear the confirmation message before next response
        continue;
      }
      
      if (userMessage.toLowerCase() === '/model') {
        // Show loading indicator
        const modelSpinner = ora('Opening model selector...').start();
        
        // Small delay to show the spinner
        await new Promise(resolve => setTimeout(resolve, 300));
        modelSpinner.stop();
        
        // Clear the loading line
        clearLines(1);
        
        await changeModel();
        
        // Clear the model selection UI (approximately 10-15 lines)
        clearLines(15);
        
        // Reload configuration with new model
        const newModelId = getConfig('selected_model');
        const newModelInfo = getAllModels()[newModelId];
        
        if (!newModelInfo) {
          console.log(chalk.red('❌ Failed to load new model. Continuing with current model.\n'));
          continue;
        }
        
        // Get API key from environment based on provider
        let newApiKey;
        if (newModelInfo.provider === 'xai') {
          newApiKey = process.env.XAI_API_KEY;
        } else {
          newApiKey = process.env.GOOGLE_API_KEY;
        }
        
        // Update current model and provider
        currentModel = newModelId;
        currentModelInfo = newModelInfo;
        currentApiKey = newApiKey;
        provider = createProvider(currentModelInfo.provider, currentApiKey, currentModelInfo.model);
        
        // Show clean confirmation
        console.log(chalk.green(`\n✓ Switched to ${currentModelInfo.name}`));
        
        // Re-inject context into new model
        await injectContext();
        
        // Track lines to clear before next message (confirmation + context loaded + blank line)
        linesToClearBeforeNextMessage = 3;
        continue;
      }
      
      // Add user message to history
      conversationHistory.push({
        role: 'user',
        content: userMessage
      });
      
      // Update conversation tokens
      conversationTokens += countTokens(userMessage);
      
      // Build full prompt with conversation history (context already sent once)
      let fullPrompt = '';
      
      // Add conversation history (which includes the initial context)
      if (conversationHistory.length > 0) {
        conversationHistory.forEach(msg => {
          fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
        });
      }
      
      // Add current question
      fullPrompt += `User: ${userMessage}`;
      
      // Clear any pending confirmation messages before showing response
      if (linesToClearBeforeNextMessage > 0) {
        clearLines(linesToClearBeforeNextMessage);
        linesToClearBeforeNextMessage = 0;
      }
      
      // Show thinking indicator
      console.log('');
      const thinkingSpinner = ora('Thinking...').start();
      
      // Get response from AI
      const streamWriter = createStreamWriter();
      let firstChunk = true;
      let assistantResponse = '';
      
      try {
        assistantResponse = await provider.refinePrompt(
          fullPrompt,
          systemPrompt,
          (content) => {
            if (firstChunk) {
              thinkingSpinner.stop();
              console.log(chalk.gray('promptx:'));
              firstChunk = false;
            }
            streamWriter.write(content);
          }
        );
        
        streamWriter.flush();
        console.log('\n');
        
        // Add assistant response to history
        conversationHistory.push({
          role: 'assistant',
          content: assistantResponse
        });
        
        // Update conversation tokens
        conversationTokens += countTokens(assistantResponse);
        
      } catch (error) {
        if (thinkingSpinner.isSpinning) {
          thinkingSpinner.stop();
        }
        displayError(error, modelInfo);
        console.log(chalk.gray('\nContinuing chat session...\n'));
      }
      
    } catch (error) {
      if (error.message.includes('User force closed')) {
        console.log(chalk.gray('\n\n👋 Goodbye!\n'));
        break;
      }
      console.log(chalk.red('\nError:', error.message));
      console.log(chalk.gray('Continuing chat session...\n'));
    }
  }
}

/**
 * Show chat-specific help
 */
function showChatHelp() {
  console.log('');
  console.log(chalk.cyan('Available commands:'));
  console.log('');
  console.log(chalk.gray('  /exit     Exit promptx'));
  console.log(chalk.gray('  /help     Show this help'));
  console.log(chalk.gray('  /clear    Clear conversation history'));
  console.log(chalk.gray('  /model    Switch AI model'));
  console.log('');
}

