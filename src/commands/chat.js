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

    return await handleChatToolCall(toolName, parameters, context);
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

      // Get response from AI with buffered streaming
      let responseBuffer = '';
      let assistantResponse = '';
      let hasToolCalls = false;

      // Track if any tools were called during this response
      const trackingHandleToolCall = async (toolName, parameters) => {
        hasToolCalls = true;
        return await handleToolCall(toolName, parameters);
      };

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
 * Display buffered AI response with proper formatting
 * @param {string} text - Text to display
 */
async function displayBufferedResponse(text) {
  const streamWriter = createStreamWriter();
  streamWriter.write(text);
  streamWriter.flush();
}

/**
 * Show chat-specific help
 */

