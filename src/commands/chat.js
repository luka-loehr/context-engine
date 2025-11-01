import chalk from 'chalk';
import dotenv from 'dotenv';
import ora from 'ora';
import inquirer from 'inquirer';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promptForUserInput } from '../ui/prompts.js';
import { createProvider } from '../providers/index.js';
import { getSystemPrompt, buildProjectContextPrefix } from '../constants/prompts.js';
import { createStreamWriter } from '../utils/stream-writer.js';
import { displayError, colorizeModelName } from '../ui/output.js';
import { formatTokenCount, countTokens } from '../utils/tokenizer.js';
import { TOOLS, executeTool } from '../utils/tools.js';
import { changeModel } from './model.js';
import { getOrSetupConfig, setConfig, getConfig } from '../config/config.js';

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
async function showWelcomeBanner(projectContext, contextPrefix) {
  // Show current directory and git status
  console.log(chalk.gray(`${process.cwd()}${await getGitStatus()}\n`));

  // Welcome header
  console.log(chalk.cyan.bold('* Welcome to context-engine!'));
  console.log('');

  // Show project info
  console.log(chalk.gray('cwd: ' + process.cwd()));

  if (projectContext && projectContext.length > 0) {
    // Calculate tokens from what we actually send (file paths + markdown content)
    const totalTokens = countTokens(contextPrefix);
    const formattedTokens = formatTokenCount(totalTokens);
    console.log(chalk.gray(`loaded: ${projectContext.length} files (${formattedTokens})\n`));
  } else {
    console.log(chalk.yellow('loaded: 0 files (no project detected)\n'));
  }

  console.log(chalk.cyan('🚀 Smart Context Engine Features:'));
  console.log('');
  console.log(chalk.gray('  • Instant whole-folder structure preload & injection'));
  console.log(chalk.gray('  • AI-powered context retrieval - loads exactly what you need'));
  console.log(chalk.gray('  • Multi-file analysis with intelligent file selection'));
  console.log(chalk.gray('  • Real-time code understanding & bug detection'));
  console.log(chalk.gray('  • Ask anything about your codebase - from architecture to implementation\n'));
}

/**
 * Start interactive chat session with codebase context
 */
export async function startChatSession(selectedModel, modelInfo, apiKey, projectContext) {
  // Build system prompt with project context
  const systemPrompt = getSystemPrompt();
  const contextPrefix = buildProjectContextPrefix(projectContext);
  
  // Show welcome banner
  await showWelcomeBanner(projectContext, contextPrefix);
  
  // Conversation history
  const conversationHistory = [];
  const initialContextMessages = []; // Store initial context separately
  
  // Token tracking
  let currentModel = selectedModel;
  let currentModelInfo = modelInfo;
  let currentApiKey = apiKey;
  const baseTokens = countTokens(contextPrefix) + countTokens(systemPrompt);
  let conversationTokens = 0;
  
  // Track lines to clear before next message
  let linesToClearBeforeNextMessage = 0;
  
  // Store full project context for tool calls
  const fullProjectContext = projectContext;
  
  // Ensure API key is present
  if (!currentApiKey) {
    console.log(chalk.red(`\nMissing API key. Please set XAI_API_KEY in your environment or use /api to import from .env file.`));
    console.log(chalk.gray('Example:'));
    console.log(chalk.gray('  export XAI_API_KEY="xai-your_key_here"'));
    process.exit(1);
  }
  // Create provider (use the actual model name)
  let provider = createProvider(currentModelInfo.provider, currentApiKey, currentModelInfo.model);
  
  // Tool definitions for AI
  const tools = [TOOLS.getFileContent, TOOLS.exit, TOOLS.help, TOOLS.model, TOOLS.api, TOOLS.clear];
  
  // Tool call handler
  let currentToolSpinner = null;
  let thinkingSpinner = null;
  
  async function handleToolCall(toolName, parameters) {
    // Stop thinking spinner if it's running
    if (thinkingSpinner && thinkingSpinner.isSpinning) {
      thinkingSpinner.stop();
      thinkingSpinner = null;
    }

    // Special handling for various tools
    if (toolName === 'exit') {
      console.log(chalk.gray('\n👋 Goodbye!\n'));
      process.exit(0);
    }

    if (toolName === 'help') {
      showChatHelp();
      return { success: true, message: 'Help displayed', stopLoop: true };
    }

    if (toolName === 'model') {
      // Interactive model switcher
      await changeModel();
      // Reload configuration (provider, model, api key) - changeModel() already shows success message
      const updated = await getOrSetupConfig();
      currentModel = updated.selectedModel;
      currentModelInfo = updated.modelInfo;
      currentApiKey = updated.apiKey;
      if (!currentApiKey) {
        console.log(chalk.red(`\nMissing API key. Please use /api to import from .env file or set XAI_API_KEY environment variable.`));
      }
      provider = createProvider(currentModelInfo.provider, currentApiKey, currentModelInfo.model);
      return { success: true, message: 'Model changed', stopLoop: true };
    }

    if (toolName === 'api') {
      // API key management
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'API Key Management:',
          choices: [
            { name: 'Show current API keys', value: 'show_keys' },
            { name: 'Import from .env file', value: 'import_env' },
            { name: 'Cancel', value: 'cancel' }
          ]
        }
      ]);

      if (action === 'show_keys') {
        const xaiKey = getConfig('xai_api_key');

        console.log(chalk.cyan('\nCurrent API Keys:'));
        console.log(chalk.gray('  XAI API Key: ') + (xaiKey ? chalk.green('✓ Set') : chalk.red('✗ Not set')));
        console.log('');
      }

      if (action === 'import_env') {
        const envPath = path.join(process.cwd(), '.env');

        if (!fs.existsSync(envPath)) {
          console.log(chalk.red(`No .env file found in current directory: ${process.cwd()}`));
        } else {
          try {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const envVars = dotenv.parse(envContent);

            let importedCount = 0;

            if (envVars.XAI_API_KEY) {
              setConfig('xai_api_key', envVars.XAI_API_KEY);
              importedCount++;
            }

            if (importedCount === 0) {
              console.log(chalk.yellow('No API keys found in .env file (looking for XAI_API_KEY)'));
            } else {
              console.log(chalk.green(`\nSuccessfully imported ${importedCount} API key(s) from .env file`));
              console.log(chalk.gray('You can now run context-engine in directories without .env files'));
            }
          } catch (error) {
            console.log(chalk.red(`Error reading .env file: ${error.message}`));
          }
        }
      }
      return { success: true, message: 'API key management completed', stopLoop: true };
    }

    if (toolName === 'clear') {
      // Keep initial context, clear user conversation
      conversationHistory.length = 0;
      conversationHistory.push(...initialContextMessages);
      conversationTokens = 0;
      console.clear();
      await showWelcomeBanner(projectContext, contextPrefix);
      console.log(chalk.green('✓ Conversation history cleared (context preserved)\n'));
      linesToClearBeforeNextMessage = 2; // Clear the confirmation message before next response
      return { success: true, message: 'Conversation cleared', stopLoop: true };
    }

    // Show file loading spinner
    const fileName = parameters.filePath || 'file';
    
    // Stop thinking spinner first if running (only once for first tool call)
    if (thinkingSpinner && thinkingSpinner.isSpinning) {
      thinkingSpinner.stop();
      thinkingSpinner = null;
    }
    
    // Create a local spinner for this specific tool call (for concurrent execution)
    const localSpinner = ora(`Loading ${chalk.cyan(fileName)}`).start();

    // Execute tool
    const result = executeTool(toolName, parameters, fullProjectContext);

    // Calculate tokens from the file content (result is now an object)
    const tokens = result.content ? countTokens(result.content) : 0;
    const formattedTokens = formatTokenCount(tokens);

    // Complete spinner asynchronously with random delay (don't block tool return)
    const delay = 500 + Math.random() * 500;
    setTimeout(() => {
      localSpinner.succeed(`Loaded ${chalk.cyan(fileName)} ${chalk.gray(`(${formattedTokens})`)}`);
    }, delay);
    
    return result;
  }
  
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
      
      contextSpinner.succeed('Context-engine initialized');
      
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
      
      // Clear any pending confirmation messages immediately after user input
      // This clears messages that are ABOVE the user's input line
      if (linesToClearBeforeNextMessage > 0) {
        // Save current position (after user input)
        process.stdout.write('\x1b[s'); // Save cursor position
        
        // Move up to the confirmation messages
        // User input line (1) + lines to clear
        for (let i = 0; i < 1 + linesToClearBeforeNextMessage; i++) {
          process.stdout.write('\x1b[1A'); // Move up
        }
        
        // Clear each confirmation line
        for (let i = 0; i < linesToClearBeforeNextMessage; i++) {
          process.stdout.write('\x1b[2K'); // Clear line
          if (i < linesToClearBeforeNextMessage - 1) {
            process.stdout.write('\x1b[1B'); // Move down for next line to clear
          }
        }
        
        // Restore cursor position (after user input)
        process.stdout.write('\x1b[u'); // Restore cursor position
        
        linesToClearBeforeNextMessage = 0;
      }
      
      // Handle commands
      if (userMessage.toLowerCase() === '/exit') {
        console.log(chalk.gray('\n👋 Goodbye!\n'));
        break;
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
      
      // Show thinking indicator - directly after user input for single spacing
      thinkingSpinner = ora('Thinking...').start();
      
      // Get response from AI
      const streamWriter = await createStreamWriter();
      let firstChunk = true;
      let assistantResponse = '';
      
      try {
        assistantResponse = await provider.refinePrompt(
          fullPrompt,
          systemPrompt,
          (content) => {
            if (firstChunk) {
              // Stop any running spinners
              if (thinkingSpinner && thinkingSpinner.isSpinning) {
                thinkingSpinner.stop();
                thinkingSpinner = null;
              }
              // Add one empty line for spacing
              console.log('');
              // Print header
              console.log(chalk.gray('context-engine:'));
              firstChunk = false;
            }
            streamWriter.write(content);
          },
          tools,
          handleToolCall
        );
        
        streamWriter.flush();
        console.log('\n');  // Single empty line after response
        
        // Add assistant response to history
        conversationHistory.push({
          role: 'assistant',
          content: assistantResponse
        });
        
        // Update conversation tokens
        conversationTokens += countTokens(assistantResponse);
        
      } catch (error) {
        if (thinkingSpinner && thinkingSpinner.isSpinning) {
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
  console.log(chalk.cyan('Context-Engine v4.0.0'));
  console.log('');
  console.log(chalk.gray('Tips for getting started:'));
  console.log('');
  console.log(chalk.gray('  • Ask me anything about your codebase - I have instant access to all files'));
  console.log(chalk.gray('  • Say "change model" or "manage API keys" to access settings'));
  console.log(chalk.gray('  • Say "clear chat" to reset conversation or "exit" to close'));
  console.log(chalk.gray('  • I automatically load relevant files when you ask questions'));
  console.log('');
}

