/**
 * Context Engine - Chat Command
 * Main chat session and tool execution logic
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { promptForUserInput } from '../ui/prompts.js';
import { createProvider } from '../providers/index.js';
import { getSystemPrompt, buildProjectContextPrefix } from '../constants/prompts.js';
import { createStreamWriter } from '../utils/stream-writer.js';
import { displayError, colorizeModelName } from '../ui/output.js';
import { formatTokenCount, countTokens } from '../utils/tokenizer.js';
import { getRandomDelay, createFileReadSpinner, completeFileReadSpinner } from '../utils/common.js';
import { getToolsForContext, executeToolInContext } from '../tools/index.js';
import { changeModel } from './model.js';
import { getOrSetupConfig, setConfig, getConfig } from '../config/config.js';
import { getAllSubAgentTools } from '../sub-agents/index.js';
import { handleChatToolCall } from './chat-tool-handler.js';
import {
  createSession,
  addUserMessage,
  addAssistantMessage,
  addInitialContext,
  clearConversationHistory
} from '../session/index.js';
import { showWelcomeBanner } from '../session/index.js';
import { clearScreen, clearPromptOutput } from '../terminal/index.js';
import { handleAPIError } from '../errors/index.js';


/**
 * Start interactive chat session with codebase context
 */
export async function startChatSession(selectedModel, modelInfo, apiKey, projectContext, singleMessage = null) {
  // Build system prompt with project context
  const systemPrompt = getSystemPrompt();
  const contextPrefix = buildProjectContextPrefix(projectContext);

  // Show welcome banner
  await showWelcomeBanner(projectContext, contextPrefix);

  // Create session using new session management
  const session = createSession(selectedModel, modelInfo, apiKey);
  session.fullProjectContext = projectContext;

  // Current session state (for backwards compatibility during refactoring)
  let currentModel = selectedModel;
  let currentModelInfo = modelInfo;
  let currentApiKey = apiKey;

  // Ensure API key is present
  if (!currentApiKey) {
    console.log(chalk.red(`\nMissing API key. Please set XAI_API_KEY in your environment or use /api to import from .env file.`));
    console.log(chalk.gray('Example:'));
    console.log(chalk.gray('  export XAI_API_KEY="xai-your_key_here"'));
    process.exit(1);
  }
  // Create provider (use the actual model name)
  let provider = createProvider(currentModelInfo.provider, currentApiKey, currentModelInfo.model);

  // Tool definitions for AI: main tools + exposed subagent tools
  const tools = [
    ...getToolsForContext('main'),
    ...getAllSubAgentTools()
  ];

  // Tool call handler
  let currentToolSpinner = null;
  let thinkingSpinner = null;

  // Track subagent calls to enable batching
  let activeSubAgentCalls = new Map();
  let subAgentCallId = 0;

  /**
   * Handle tool calls from the AI
   */
  async function handleToolCall(toolName, parameters) {
    const context = {
      thinkingSpinner,
      session,
      projectContext,
      contextPrefix,
      get currentModel() { return currentModel; },
      set currentModel(value) { currentModel = value; },
      get currentModelInfo() { return currentModelInfo; },
      set currentModelInfo(value) { currentModelInfo = value; },
      get currentApiKey() { return currentApiKey; },
      set currentApiKey(value) { currentApiKey = value; },
      get provider() { return provider; },
      set provider(value) { provider = value; },
      activeSubAgentCalls,
      subAgentCallId
    };

<<<<<<< HEAD
    return await handleChatToolCall(toolName, parameters, context);
=======
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
      clearConversationHistory(session);
      clearScreen();
      await showWelcomeBanner(projectContext, contextPrefix);
      console.log(chalk.green('✓ Conversation history cleared (context preserved)\n'));
      session.linesToClearBeforeNextMessage = 2; // Clear the confirmation message before next response
      return { success: true, message: 'Conversation cleared', stopLoop: true };
    }

    // Natural language only: no special prompt injection command

    // Generic subagent handler - works for ALL subagents
    if (isSubAgentTool(toolName)) {
      // Handle subagent creation with concurrent execution support
      const callId = ++subAgentCallId;

      // Create a promise that will be resolved when this call should execute
      let resolveExecution;
      const executionPromise = new Promise(resolve => {
        resolveExecution = resolve;
      });

      // Register this call
      const callInfo = {
        id: callId,
        toolName,
        parameters,
        resolveExecution,
        executionPromise
      };
      activeSubAgentCalls.set(callId, callInfo);

      // Set a microtask to check if we're the coordinator (first call)
      await Promise.resolve(); // Let all synchronous tool calls register first

      // If we're the first call, coordinate the batch
      if (callId === Math.min(...Array.from(activeSubAgentCalls.keys()))) {
        // Wait a tiny bit more for any remaining calls
        await new Promise(resolve => setTimeout(resolve, 50));

        const allCalls = Array.from(activeSubAgentCalls.values());
        activeSubAgentCalls.clear();

        if (allCalls.length > 1) {
          // Multiple subagents - execute concurrently via generic executor
          const executionPromises = allCalls.map(call => {
            const agentId = call.toolName.startsWith('run_')
              ? call.toolName.replace(/^run_/, '').replace(/_/g, '-')
              : getSubAgentByToolName(call.toolName)?.id;
            const agentConfig = agentId ? autoAgentRegistry.getAgent(agentId) : getSubAgentByToolName(call.toolName);
            return agentConfig
              ? genericAgentExecutor.execute(
                agentConfig,
                {
                  projectContext: session.fullProjectContext,
                  modelInfo: currentModelInfo,
                  apiKey: currentApiKey
                },
                call.parameters?.customInstructions || null
              )
              : Promise.resolve({ success: false, error: `Unknown subagent: ${call.toolName}` });
          });
          const results = await Promise.all(executionPromises);
          const names = results.map(r => r.agentName).filter(Boolean).join(' and ');
          let detailedMessage = `Successfully executed ${names}.\n\n`;
          const generatedContent = [];
          results.forEach(r => {
            if (r.generatedFiles && r.generatedFiles.length > 0) {
              generatedContent.push(...r.generatedFiles);
            }
          });
          if (generatedContent.length > 0) {
            detailedMessage += `## Generated Files\n`;
            generatedContent.forEach(file => {
              detailedMessage += `- **${file.path}**: ${file.successMessage || 'Created successfully'}\n`;
            });
            detailedMessage += `\n`;
          }
          const result = {
            success: true,
            message: detailedMessage,
            subAgentResults: results,
            stopLoop: false
          };
          allCalls.forEach(call => call.resolveExecution(result));
          return result;
        } else {
          // Single subagent - execute directly via generic executor
          const agentId = toolName.startsWith('run_')
            ? toolName.replace(/^run_/, '').replace(/_/g, '-')
            : getSubAgentByToolName(toolName)?.id;
          const agentConfig = agentId ? autoAgentRegistry.getAgent(agentId) : getSubAgentByToolName(toolName);
          const executionResult = await genericAgentExecutor.execute(
            agentConfig,
            {
              projectContext: session.fullProjectContext,
              modelInfo: currentModelInfo,
              apiKey: currentApiKey
            },
            parameters?.customInstructions || null
          );

          // Create detailed result message for the main AI
          let detailedMessage = `${executionResult.agentName} completed successfully.\n\n`;

          // Add summary of work done
          if (executionResult.analysis && executionResult.analysis.summary) {
            detailedMessage += `## Summary\n${executionResult.analysis.summary}\n\n`;
          }

          // Add details about generated content if available
          if (executionResult.generatedFiles && executionResult.generatedFiles.length > 0) {
            detailedMessage += `## Generated Files\n`;
            executionResult.generatedFiles.forEach(file => {
              detailedMessage += `- **${file.path}**: ${file.successMessage || 'Created successfully'}\n`;
            });
            detailedMessage += `\n`;
          }

          // Add analysis details if available
          if (executionResult.analysis) {
            detailedMessage += `## Analysis Details\n`;
            detailedMessage += `- Files analyzed: ${executionResult.totalFilesRead || 0}\n`;
            detailedMessage += `- Files created: ${executionResult.totalFilesCreated || 0}\n`;
          }

          // Add full content for AI reference (not for output to user)
          if (executionResult.generatedFiles && executionResult.generatedFiles.length > 0) {
            detailedMessage += `\n## Full Content (For Your Reference - DO NOT Output to User)\n`;
            detailedMessage += `The following is the complete generated content. You can reference this to answer user questions, but DO NOT output it directly.\n\n`;
            executionResult.generatedFiles.forEach(file => {
              detailedMessage += `### File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
            });
          }

          const result = {
            success: true,
            message: detailedMessage,
            subAgentResults: executionResult,
            stopLoop: false
          };
          allCalls[0].resolveExecution(result);
          return result;
        }
      } else {
        // Not the coordinator - wait for execution
        return await executionPromise;
      }
    }

    // Show file reading spinner only for meaningful file operations
    const fileName = parameters.filePath || 'file';
    const isMeaningfulFile = fileName !== 'file' && fileName.includes('.'); // Only show for actual files with extensions

    // Stop thinking spinner first if running (only once for first tool call)
    if (thinkingSpinner && thinkingSpinner.isSpinning) {
      thinkingSpinner.stop();
      thinkingSpinner = null;
    }

    // Create a local spinner for this specific tool call (for concurrent execution)
    const localSpinner = isMeaningfulFile ? ora(`Reading ${chalk.cyan(fileName)}`).start() : null;

    // Execute tool
    const result = await executeToolInContext(toolName, parameters, 'main', {
      projectContext: session.fullProjectContext
    });

    // Calculate tokens from the file content (result is now an object)
    const tokens = result.content ? countTokens(result.content) : 0;
    const formattedTokens = formatTokenCount(tokens);

    // Complete spinner asynchronously with random delay (don't block tool return)
    const delay = 500 + Math.random() * 500;
    setTimeout(() => {
      if (localSpinner) {
        // Only show detailed message if there are tokens
        if (tokens > 0) {
          localSpinner.succeed(`Read ${chalk.cyan(fileName)} ${chalk.gray(`(${formattedTokens})`)}`);
        } else {
          // Silent completion for empty files
          localSpinner.stop();
        }
      }
    }, delay);

    return result;
>>>>>>> c43fb46 (refactor: improve terminal UI and welcome banner)
  }

  // Helper function to inject context into AI
  async function injectContext() {
    if (!projectContext || projectContext.length === 0) return;

    const contextSpinner = ora('Preparing AI context (this may take a moment)...').start();

    try {
      const initialContextMessage = contextPrefix + '\n\nPlease respond with just "ready" when you have processed all the project files and are ready to answer questions.';

      const acknowledgment = await provider.refinePrompt(
        initialContextMessage,
        systemPrompt,
        null // No streaming for this initial message
      );

      contextSpinner.succeed('Context loaded and ready');

      // Store initial context messages using session management
      const initialMessages = [
        { role: 'user', content: contextPrefix },
        { role: 'assistant', content: acknowledgment }
      ];
      addInitialContext(session, initialMessages);

      console.log('');
    } catch (error) {
      contextSpinner.fail('Failed to load context');
      handleAPIError(error, currentModelInfo);
      console.log(chalk.yellow('\nContinuing without context...\n'));
    }
  }

  // Send initial context to AI ONCE
  await injectContext();

  // Handle single message mode (non-interactive)
  if (singleMessage) {
    try {
      // Add user message to session
      addUserMessage(session, singleMessage);

      // Build full prompt with conversation history (context already sent once)
      let fullPrompt = '';

      // Add conversation history from session (which includes the initial context)
      if (session.conversationHistory.length > 0) {
        session.conversationHistory.forEach(msg => {
          fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
        });
      }

      // Add current question
      fullPrompt += `User: ${singleMessage}`;

      // Show thinking indicator
      thinkingSpinner = ora('Thinking...').start();

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
        console.log('');  // Single line spacing after response

        // Add assistant response to session
        addAssistantMessage(session, assistantResponse);

      } catch (error) {
        if (thinkingSpinner && thinkingSpinner.isSpinning) {
          thinkingSpinner.stop();
        }
        handleAPIError(error, currentModelInfo);
        console.log(chalk.gray('\nContinuing chat session...\n'));
      }

      // Exit after single message
      return;

    } catch (error) {
      console.log(chalk.red('\nError:', error.message));
      return;
    }
  }

  // Chat loop (interactive mode)
  while (true) {
    try {
      // Get user input
      const userMessage = await promptForUserInput('>');

      // Clear any pending confirmation messages immediately after user input
      // This clears messages that are ABOVE the user's input line
      if (session.linesToClearBeforeNextMessage > 0) {
        // Save current position (after user input)
        process.stdout.write('\x1b[s'); // Save cursor position

        // Move up to the confirmation messages
        // User input line (1) + lines to clear
        for (let i = 0; i < 1 + session.linesToClearBeforeNextMessage; i++) {
          process.stdout.write('\x1b[1A'); // Move up
        }

        // Clear each confirmation line
        for (let i = 0; i < session.linesToClearBeforeNextMessage; i++) {
          process.stdout.write('\x1b[2K'); // Clear line
          if (i < session.linesToClearBeforeNextMessage - 1) {
            process.stdout.write('\x1b[1B'); // Move down for next line to clear
          }
        }

        // Restore cursor position (after user input)
        process.stdout.write('\x1b[u'); // Restore cursor position

        session.linesToClearBeforeNextMessage = 0;
      }

      // Handle commands
      if (userMessage.toLowerCase() === '/exit') {
        console.log(chalk.gray('\n👋 Goodbye!\n'));
        break;
      }

      // Add user message to session
      addUserMessage(session, userMessage);

      // Build full prompt with conversation history (context already sent once)
      let fullPrompt = '';

      // Add conversation history from session (which includes the initial context)
      if (session.conversationHistory.length > 0) {
        session.conversationHistory.forEach(msg => {
          fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
        });
      }

      // Add current question
      fullPrompt += `User: ${userMessage}`;

      // Show thinking indicator - directly after user input for single spacing
      thinkingSpinner = ora('Thinking...').start();

<<<<<<< HEAD
      // Get response from AI with buffered streaming
      let responseBuffer = '';
      let assistantResponse = '';
      let hasToolCalls = false;

      // Track if any tools were called during this response
      const trackingHandleToolCall = async (toolName, parameters) => {
        hasToolCalls = true;
        return await handleToolCall(toolName, parameters);
      };
=======
      // Get response from AI
      const streamWriter = createStreamWriter();
      let firstChunk = true;
      let assistantResponse = '';
>>>>>>> c43fb46 (refactor: improve terminal UI and welcome banner)

      try {
        assistantResponse = await provider.refinePrompt(
          fullPrompt,
          systemPrompt,
          (content) => {
            // Buffer the content instead of displaying immediately
            responseBuffer += content;
          },
          tools,
          trackingHandleToolCall
        );

<<<<<<< HEAD
        // Set assistantResponse to the buffered content
        assistantResponse = responseBuffer;

        // Now display the buffered response
        if (responseBuffer.trim()) {
          // Stop any remaining spinners
          if (thinkingSpinner && thinkingSpinner.isSpinning) {
            thinkingSpinner.stop();
            thinkingSpinner = null;
          }

          // Display header
          console.log('');
          console.log(chalk.gray('context-engine:'));

          // Display buffered response with proper formatting
          await displayBufferedResponse(responseBuffer);
          console.log('');  // Single line spacing after response
        }
=======
        streamWriter.flush();
        console.log('');  // Single line spacing after response
>>>>>>> c43fb46 (refactor: improve terminal UI and welcome banner)

        // Add assistant response to session
        addAssistantMessage(session, assistantResponse);

      } catch (error) {
        if (thinkingSpinner && thinkingSpinner.isSpinning) {
          thinkingSpinner.stop();
        }
        handleAPIError(error, currentModelInfo);
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
 * Display buffered AI response with typewriter effect to simulate streaming
 * @param {string} text - Text to display
 */
async function displayBufferedResponse(text) {
  // Apply basic inline formatting
  let formattedText = text
    .replace(/\*\*(.*?)\*\*/g, (_, content) => chalk.white.bold(content))
    .replace(/\*(.*?)\*/g, (_, content) => chalk.italic(content))
    .replace(/`(.*?)`/g, (_, content) => chalk.yellow(content));

  // Split into words while preserving whitespace
  const words = formattedText.split(/(\s+)/);
  let displayText = '';

  // Type out each word with realistic timing
  for (const word of words) {
    displayText += word;

    // Clear line and rewrite with current progress
    process.stdout.write('\r\x1b[K');
    process.stdout.write(chalk.gray('context-engine: ') + displayText);

    // Calculate delay based on word characteristics
    const isPunctuation = /^[^\w]*$/.test(word.trim());
    const delay = isPunctuation ? 25 : Math.max(35, Math.min(100, word.replace(/\s/g, '').length * 20));
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Clean final output
  console.log('');
}

/**
 * Show chat-specific help
 */

