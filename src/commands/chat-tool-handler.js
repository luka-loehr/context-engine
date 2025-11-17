/**
 * Context Engine - Chat Tool Handler
 * Handles tool calls from the AI during chat sessions
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { changeModel } from './model.js';
import { getOrSetupConfig, setConfig, getConfig } from '../config/config.js';
import { createProvider } from '../providers/index.js';
import { clearConversationHistory, showWelcomeBanner } from '../session/index.js';
import { clearScreen } from '../terminal/index.js';
import { isSubAgentTool, getSubAgentByToolName, autoAgentRegistry } from '../sub-agents/index.js';
import { genericAgentExecutor } from '../sub-agents/core/generic-executor.js';

/**
 * Utility class for handling common chat tool operations
 */
class ChatToolUtils {
  /**
   * Get agent configuration from tool name
   */
  static getAgentConfig(toolName) {
    const agentId = toolName.startsWith('run_')
      ? toolName.replace(/^run_/, '').replace(/_/g, '-')
      : getSubAgentByToolName(toolName)?.id;
    return agentId ? autoAgentRegistry.getAgent(agentId) : getSubAgentByToolName(toolName);
  }

  /**
   * Create execution context for agent
   */
  static createExecutionContext(session, currentModelInfo, currentApiKey) {
    return {
      projectContext: session.fullProjectContext,
      modelInfo: currentModelInfo,
      apiKey: currentApiKey
    };
  }

  /**
   * Create detailed result message from execution result
   */
  static createResultMessage(executionResult) {
    let message = `${executionResult.agentName} completed successfully.\n\n`;

    // Add summary if available
    if (executionResult.analysis?.summary) {
      message += `## Summary\n${executionResult.analysis.summary}\n\n`;
    }

    // Add generated files if any
    if (executionResult.generatedFiles?.length > 0) {
      message += `## Generated Files\n`;
      executionResult.generatedFiles.forEach(file => {
        message += `- **${file.path}**: ${file.successMessage || 'Created successfully'}\n`;
      });
      message += `\n`;
    }

    return message;
  }
}

/**
 * Handle tool calls from the AI during chat sessions
 * @param {string} toolName - Name of the tool being called
 * @param {object} parameters - Tool parameters
 * @param {object} context - Execution context
 * @returns {Promise<object>} Tool execution result
 */
export async function handleChatToolCall(toolName, parameters, context) {
  const {
    thinkingSpinner,
    session,
    projectContext,
    contextPrefix,
    currentModel,
    currentModelInfo,
    currentApiKey,
    activeSubAgentCalls,
    subAgentCallId
  } = context;

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
    context.currentModel = updated.selectedModel;
    context.currentModelInfo = updated.modelInfo;
    context.currentApiKey = updated.apiKey;
    if (!context.currentApiKey) {
      console.log(chalk.red(`\nMissing API key. Please use /api to import from .env file or set XAI_API_KEY environment variable.`));
    }
    context.provider = createProvider(context.currentModelInfo.provider, context.currentApiKey, context.currentModelInfo.model);
    return { success: true, message: 'Model changed', stopLoop: true };
  }

  if (toolName === 'api') {
    return await handleApiTool();
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

  // Generic subagent handler - works for ALL subagents
  if (isSubAgentTool(toolName)) {
    return await handleSubAgentTool(toolName, parameters, context);
  }

  // If we get here, it's an unknown tool
  return { success: false, error: `Unknown tool: ${toolName}` };
}

/**
 * Handle API key management tool
 */
async function handleApiTool() {
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

/**
 * Handle subagent tool calls
 */
async function handleSubAgentTool(toolName, parameters, context) {
  const {
    activeSubAgentCalls,
    subAgentCallId,
    session,
    currentModelInfo,
    currentApiKey
  } = context;

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
      return await executeMultipleSubAgents(allCalls, context);
    } else {
      // Single subagent - execute directly via generic executor
      return await executeSingleSubAgent(toolName, parameters, context);
    }
  }

  // Wait for our execution to be resolved by the coordinator
  return await executionPromise;
}

/**
 * Execute multiple subagents concurrently
 */
async function executeMultipleSubAgents(allCalls, context) {
  const { session, currentModelInfo, currentApiKey } = context;

  const executionPromises = allCalls.map(call => {
    const agentConfig = ChatToolUtils.getAgentConfig(call.toolName);
    return agentConfig
      ? genericAgentExecutor.execute(
          agentConfig,
          ChatToolUtils.createExecutionContext(session, currentModelInfo, currentApiKey),
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
}

/**
 * Execute a single subagent
 */
async function executeSingleSubAgent(toolName, parameters, context) {
  const { session, currentModelInfo, currentApiKey } = context;

  const agentConfig = ChatToolUtils.getAgentConfig(toolName);
  const executionResult = await genericAgentExecutor.execute(
    agentConfig,
    ChatToolUtils.createExecutionContext(session, currentModelInfo, currentApiKey),
    parameters?.customInstructions || null
  );

  return {
    success: true,
    message: ChatToolUtils.createResultMessage(executionResult),
    subAgentResult: executionResult,
    stopLoop: false
  };
}

/**
 * Show chat help information
 */
function showChatHelp() {
  console.log(chalk.cyan('\n💡 Context Engine Chat Commands:'));
  console.log('');
  console.log(chalk.white('Available Commands:'));
  console.log(chalk.gray('  exit') + '                    - Exit the chat session');
  console.log(chalk.gray('  help') + '                    - Show this help message');
  console.log(chalk.gray('  model') + '                   - Change AI model');
  console.log(chalk.gray('  api') + '                     - Manage API keys');
  console.log(chalk.gray('  clear') + '                   - Clear conversation history');
  console.log('');
  console.log(chalk.white('Subagents:'));
  console.log(chalk.gray('  readme-md') + '               - Generate README.md files');
  console.log(chalk.gray('  agents-md') + '               - Generate AGENTS.md files');
  console.log('');
  console.log(chalk.white('File Operations:'));
  console.log(chalk.gray('  Read files') + '              - Use natural language: "read package.json"');
  console.log(chalk.gray('  Create files') + '            - "create a new file called utils.js with..."');
  console.log(chalk.gray('  Edit files') + '              - "update the function in file.js to..."');
  console.log('');
  console.log(chalk.white('Terminal Commands:'));
  console.log(chalk.gray('  Run commands') + '           - "run git status" or "execute npm test"');
  console.log('');
  console.log(chalk.gray('Just type naturally - the AI understands what you want to do! 🚀\n'));
}
