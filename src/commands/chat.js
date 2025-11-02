import chalk from 'chalk';
import dotenv from 'dotenv';
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
import { TOOLS, executeTool } from '../utils/tools.js';
import { getToolsForContext } from '../tools/index.js';
import { changeModel } from './model.js';
import { getOrSetupConfig, setConfig, getConfig } from '../config/config.js';
import { getSubAgentByToolName, isSubAgentTool, SubAgentManager, getAllSubAgentTools } from '../sub-agents/index.js';
import {
  createSession,
  addUserMessage,
  addAssistantMessage,
  addInitialContext,
  clearConversationHistory,
  getTotalTokens
} from '../session/index.js';
import { showWelcomeBanner } from '../session/index.js';
import { clearScreen, clearPromptOutput } from '../terminal/index.js';
import { handleAPIError } from '../errors/index.js';


/**
 * Start interactive chat session with codebase context
 */
export async function startChatSession(selectedModel, modelInfo, apiKey, projectContext) {
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
  
  // Tool definitions for AI - get from ToolRegistry for main context + subagent tools
  const tools = [
    ...getToolsForContext('main'), // Tools available to main AI from registry
    ...getAllSubAgentTools()        // Dynamically add all subagent creation tools
  ];
  
  // Tool call handler
  let currentToolSpinner = null;
  let thinkingSpinner = null;
  
  // Track subagent calls to enable batching
  let activeSubAgentCalls = new Map();
  let subAgentCallId = 0;
  
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
      clearConversationHistory(session);
      clearScreen();
      await showWelcomeBanner(projectContext, contextPrefix);
      console.log(chalk.green('✓ Conversation history cleared (context preserved)\n'));
      session.linesToClearBeforeNextMessage = 2; // Clear the confirmation message before next response
      return { success: true, message: 'Conversation cleared', stopLoop: true };
    }

    if (toolName === 'agents') {
      // Open interactive agents menu
      const { showAgentsMenu } = await import('./agents-menu.js');
      const result = await showAgentsMenu({
        projectContext: session.fullProjectContext,
        modelInfo: currentModelInfo,
        apiKey: currentApiKey,
        session
      });
      return result;
    }

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
          // Multiple subagents - use SubAgentManager for concurrent execution
          const manager = new SubAgentManager();
          const configs = allCalls.map(call => ({
            subAgent: getSubAgentByToolName(call.toolName),
            params: {},
            projectContext: session.fullProjectContext,
            modelInfo: currentModelInfo,
            apiKey: currentApiKey,
            provider
          }));
          
          // Execute concurrently and get comprehensive results
          const executionResults = await manager.executeMultiple(configs);
          
          // Create detailed result message for the main AI
          const fileNames = configs.map(c => c.subAgent.name).join(' and ');
          let detailedMessage = `Successfully created ${fileNames}.\n\n`;

          // Add summary of work done
          detailedMessage += `## Summary\n${executionResults.summary}\n\n`;

          // Add details about generated content if available
          if (executionResults.generatedContent && executionResults.generatedContent.length > 0) {
            detailedMessage += `## Generated Files\n`;
            executionResults.generatedContent.forEach(file => {
              detailedMessage += `- **${file.path}**: ${file.successMessage || 'Created successfully'}\n`;
            });
            detailedMessage += `\n`;
          }

          // Add analysis from each subagent
          if (executionResults.results && executionResults.results.length > 0) {
            detailedMessage += `## Analysis Details\n`;
            executionResults.results.forEach(result => {
              if (result.analysis && result.analysis.summary) {
                detailedMessage += `### ${result.name}\n${result.analysis.summary}\n\n`;
              }
            });
          }

          // Add full content for AI reference (not for output to user)
          if (executionResults.generatedContent && executionResults.generatedContent.length > 0) {
            detailedMessage += `\n## Full Content (For Your Reference - DO NOT Output to User)\n`;
            detailedMessage += `The following is the complete generated content. You can reference this to answer user questions, but DO NOT output it directly.\n\n`;
            executionResults.generatedContent.forEach(file => {
              detailedMessage += `### File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
            });
          }

          const result = { 
            success: true, 
            message: detailedMessage,
            subAgentResults: executionResults,
            stopLoop: false // Let AI provide feedback about what was created
          };
          
          allCalls.forEach(call => call.resolveExecution(result));
          return result;
        } else {
          // Single subagent - execute directly
          const subAgent = getSubAgentByToolName(toolName);
          const executionResult = await subAgent.execute({}, session.fullProjectContext, currentModelInfo, currentApiKey, provider);

          // Create detailed result message for the main AI
          let detailedMessage = `${subAgent.name} creation completed successfully.\n\n`;

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
            stopLoop: false // Let AI provide feedback
          };
          allCalls[0].resolveExecution(result);
          return result;
        }
      } else {
        // Not the coordinator - wait for execution
        return await executionPromise;
      }
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
    const result = executeTool(toolName, parameters, session.fullProjectContext);

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
  
  // Chat loop
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

