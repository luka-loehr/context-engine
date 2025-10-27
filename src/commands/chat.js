import chalk from 'chalk';
import ora from 'ora';
import { promptForUserInput } from '../ui/prompts.js';
import { createProvider } from '../providers/index.js';
import { getSystemPrompt, buildProjectContextPrefix } from '../constants/prompts.js';
import { createStreamWriter } from '../utils/stream-writer.js';
import { displayError } from '../ui/output.js';
import { calculateTokens, formatTokenCount, countTokens, calculateContextPercentage } from '../utils/tokenizer.js';
import { getContextLimit } from '../constants/context-limits.js';
import { changeModel } from './model.js';
import { getConfig } from '../config/config.js';
import { getAllModels } from '../constants/models.js';

/**
 * Start interactive chat session with codebase context
 */
export async function startChatSession(selectedModel, modelInfo, apiKey, projectContext) {
  console.log(chalk.blue('\n💬 promptx - Codebase Assistant'));
  console.log(chalk.gray('─'.repeat(50)));
  
  if (projectContext && projectContext.length > 0) {
    const totalTokens = calculateTokens(projectContext);
    const formattedTokens = formatTokenCount(totalTokens);
    console.log(chalk.green(`\n✓ Loaded ${projectContext.length} files from your project`));
    console.log(chalk.gray(`  ${formattedTokens} tokens`));
  } else {
    console.log(chalk.yellow('\n⚠ No project files found in current directory'));
  }
  
  console.log(chalk.gray('\nAsk me anything about your codebase!'));
  console.log(chalk.gray('Type /exit to quit, /help for commands\n'));
  
  // Build system prompt with project context
  const systemPrompt = getSystemPrompt();
  const contextPrefix = buildProjectContextPrefix(projectContext);
  
  // Conversation history
  const conversationHistory = [];
  
  // Token tracking
  let currentModel = selectedModel;
  let currentModelInfo = modelInfo;
  let currentApiKey = apiKey;
  let contextLimit = getContextLimit(currentModel);
  const baseTokens = calculateTokens(projectContext) + countTokens(systemPrompt);
  let conversationTokens = 0;
  
  // Create provider
  let provider = createProvider(currentModelInfo.provider, currentApiKey, currentModel);
  
  // Chat loop
  while (true) {
    try {
      // Calculate current context usage
      const totalUsedTokens = baseTokens + conversationTokens;
      const contextPercentage = calculateContextPercentage(totalUsedTokens, contextLimit);
      
      // Get user input with context percentage
      const promptLabel = `You (${contextPercentage}%)`;
      const userMessage = await promptForUserInput(promptLabel);
      
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
        conversationHistory.length = 0;
        conversationTokens = 0;
        console.log(chalk.green('\n✓ Conversation history cleared\n'));
        continue;
      }
      
      if (userMessage.toLowerCase() === '/model') {
        await changeModel();
        
        // Reload configuration with new model
        const newModelId = getConfig('selected_model');
        const newModelInfo = getAllModels()[newModelId];
        
        if (!newModelInfo) {
          console.log(chalk.red('\n❌ Failed to load new model. Continuing with current model.\n'));
          continue;
        }
        
        // Get API key for new provider
        let newApiKey;
        if (newModelInfo.provider === 'ollama') {
          newApiKey = null;
        } else {
          newApiKey = getConfig(`${newModelInfo.provider}_api_key`);
        }
        
        // Update current model and provider
        currentModel = newModelId;
        currentModelInfo = newModelInfo;
        currentApiKey = newApiKey;
        contextLimit = getContextLimit(currentModel);
        provider = createProvider(currentModelInfo.provider, currentApiKey, currentModel);
        
        console.log(chalk.green(`\n✅ Switched to ${currentModelInfo.name}`));
        console.log(chalk.gray('Continuing conversation with new model...\n'));
        continue;
      }
      
      // Add user message to history
      conversationHistory.push({
        role: 'user',
        content: userMessage
      });
      
      // Update conversation tokens
      conversationTokens += countTokens(userMessage);
      
      // Build full prompt with context and history
      let fullPrompt = contextPrefix;
      
      // Add conversation history
      if (conversationHistory.length > 1) {
        fullPrompt += '\n\nCONVERSATION HISTORY:\n';
        conversationHistory.slice(0, -1).forEach(msg => {
          fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
        });
        fullPrompt += '\n';
      }
      
      // Add current question
      fullPrompt += `User: ${userMessage}`;
      
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
              console.log(chalk.blue('promptx:'));
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
  console.log(chalk.blue('\n📚 Chat Commands'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.white('  /exit    ') + chalk.gray('- Exit the chat session'));
  console.log(chalk.white('  /help    ') + chalk.gray('- Show this help'));
  console.log(chalk.white('  /clear   ') + chalk.gray('- Clear conversation history'));
  console.log(chalk.white('  /model   ') + chalk.gray('- Switch AI model on the fly'));
  console.log(chalk.gray('\n💡 Just type your questions naturally!\n'));
}

