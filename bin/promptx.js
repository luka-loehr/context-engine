#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import Conf from 'conf';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import updateNotifier from 'update-notifier';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import wrapAnsi from 'wrap-ansi';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

const execAsync = promisify(exec);

// Helper function for streaming with word wrap
function createStreamWriter() {
  const terminalWidth = process.stdout.columns || 80;
  const maxWidth = Math.min(terminalWidth - 4, 76); // Leave some margin
  let buffer = '';
  
  return {
    write(text) {
      buffer += text;
      const lines = buffer.split('\n');
      
      // Process all complete lines
      for (let i = 0; i < lines.length - 1; i++) {
        const wrappedLine = wrapAnsi(lines[i], maxWidth, { hard: true, wordWrap: true });
        console.log(wrappedLine);
      }
      
      // Keep the last incomplete line in buffer
      buffer = lines[lines.length - 1];
      
      // If buffer is getting too long, wrap and flush it
      if (buffer.length > maxWidth) {
        const wrappedBuffer = wrapAnsi(buffer, maxWidth, { hard: true, wordWrap: true });
        const wrappedLines = wrappedBuffer.split('\n');
        
        for (let i = 0; i < wrappedLines.length - 1; i++) {
          console.log(wrappedLines[i]);
        }
        
        buffer = wrappedLines[wrappedLines.length - 1];
      }
    },
    
    flush() {
      if (buffer) {
        const wrappedBuffer = wrapAnsi(buffer, maxWidth, { hard: true, wordWrap: true });
        console.log(wrappedBuffer);
        buffer = '';
      }
    }
  };
}

// User guidance functions for Ollama errors
function showOllamaNotInstalledError() {
  console.log(chalk.red('\n❌ Ollama is not installed on your system.'));
  console.log(chalk.gray('\nOllama is required to use local AI models.'));
  console.log(chalk.yellow('\n📥 To install Ollama:'));
  console.log(chalk.white('  • Visit: ') + chalk.blue('https://ollama.ai'));
  console.log(chalk.white('  • Or use: ') + chalk.cyan('curl -fsSL https://ollama.ai/install.sh | sh'));
  console.log(chalk.gray('\n💡 After installation, download models with:'));
  console.log(chalk.cyan('  ollama pull llama3'));
  console.log(chalk.cyan('  ollama pull mistral'));
  console.log(chalk.cyan('  ollama pull codellama'));
}

function showOllamaServiceNotRunningError() {
  console.log(chalk.red('\n❌ Ollama service is not running.'));
  console.log(chalk.gray('\nOllama is installed but the service needs to be started.'));
  console.log(chalk.yellow('\n🚀 To start Ollama:'));
  console.log(chalk.cyan('  ollama serve'));
  console.log(chalk.gray('\n💡 Or run Ollama in the background and try again.'));
}

function showOllamaNoModelsError() {
  console.log(chalk.red('\n❌ No Ollama models found locally.'));
  console.log(chalk.gray('\nYou need to download at least one model to use Ollama.'));
  console.log(chalk.yellow('\n📦 Recommended models for prompt refinement:'));
  console.log(chalk.cyan('  ollama pull llama3        ') + chalk.gray('# Meta\'s Llama 3 (8B) - Excellent quality'));
  console.log(chalk.cyan('  ollama pull mistral       ') + chalk.gray('# Mistral 7B - Good performance'));
  console.log(chalk.cyan('  ollama pull codellama     ') + chalk.gray('# Code Llama (7B+) - For programming'));
  console.log(chalk.yellow('\n⚠️  Note: ') + chalk.gray('Models smaller than 7-8B parameters may produce poor results for prompt refinement.'));
  console.log(chalk.gray('    For best quality, use 7B+ models like llama3, mistral, or codellama.'));
  console.log(chalk.gray('\n💡 After downloading, restart promptx to see your models.'));
}

function showOllamaConnectionError() {
  console.log(chalk.red('\n❌ Cannot connect to Ollama API.'));
  console.log(chalk.gray('\nThe Ollama service may not be running or accessible.'));
  console.log(chalk.yellow('\n🔧 Troubleshooting steps:'));
  console.log(chalk.white('  1. ') + chalk.cyan('ollama serve') + chalk.gray(' - Start the Ollama service'));
  console.log(chalk.white('  2. ') + chalk.cyan('ollama list') + chalk.gray(' - Verify models are available'));
  console.log(chalk.white('  3. Check if port 11434 is available'));
  console.log(chalk.gray('\n💡 Ollama runs on http://localhost:11434 by default.'));
}

// Function to check if Ollama service is running
async function checkOllamaService() {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Enhanced function to discover Ollama models with comprehensive error handling
async function discoverOllamaModels() {
  try {
    const { stdout, stderr } = await execAsync('ollama list');
    const lines = stdout.trim().split('\n');

    // Check if we only have headers (no models)
    if (lines.length <= 1) {
      return { error: 'no_models' };
    }

    // Skip header line and parse model information
    const models = {};
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // Parse the line: NAME    ID    SIZE    MODIFIED
        const parts = line.split(/\s+/);
        if (parts.length >= 1) {
          const modelName = parts[0];
          // Extract base model name (remove tags like :latest)
          const baseName = modelName.split(':')[0];
          models[modelName] = {
            name: baseName.charAt(0).toUpperCase() + baseName.slice(1),
            provider: 'ollama',
            fullName: modelName
          };
        }
      }
    }

    // If no models were parsed, return no_models error
    if (Object.keys(models).length === 0) {
      return { error: 'no_models' };
    }

    return models;
  } catch (error) {
    // Check specific error types
    if (error.message.includes('command not found') || error.code === 'ENOENT') {
      return { error: 'not_installed' };
    }

    // Check if it's a service not running error by testing the API
    const serviceRunning = await checkOllamaService();
    if (!serviceRunning) {
      return { error: 'service_not_running' };
    }

    // Generic error
    return { error: 'unknown', details: error.message };
  }
}

// Check for updates
const notifier = updateNotifier({ 
  pkg: packageJson,
  updateCheckInterval: 1000 * 60 * 60 * 24 // Check once per day
});

if (notifier.update) {
  console.log(chalk.yellow('\n╭─────────────────────────────────────────────────────────────╮'));
  console.log(chalk.yellow('│                                                             │'));
  console.log(chalk.yellow('│  ') + chalk.bold.green('Update available! ') + chalk.gray(`${notifier.update.current} → ${notifier.update.latest}`) + chalk.yellow('                      │'));
  console.log(chalk.yellow('│                                                             │'));
  console.log(chalk.yellow('│  ') + chalk.cyan('Run ') + chalk.bold.white('npm install -g @lukaloehr/promptx') + chalk.cyan(' to update') + chalk.yellow('      │'));
  console.log(chalk.yellow('│                                                             │'));
  console.log(chalk.yellow('╰─────────────────────────────────────────────────────────────╯\n'));
}

const config = new Conf({ projectName: 'promptx' });

const MODELS = {
  openai: {
    'gpt-5': { name: 'GPT-5', provider: 'openai' },
    'gpt-5-mini': { name: 'GPT-5 Mini', provider: 'openai' },
    'gpt-5-nano': { name: 'GPT-5 Nano', provider: 'openai' }
  },
  anthropic: {
    'claude-sonnet-4-5': { name: 'Claude Sonnet 4.5', provider: 'anthropic' },
    'claude-haiku-4-5': { name: 'Claude Haiku 4.5', provider: 'anthropic' },
    'claude-opus-4-1': { name: 'Claude Opus 4.1', provider: 'anthropic' }
  },
  xai: {
    'grok-code-fast-1': { name: 'Grok Code Fast 1', provider: 'xai' },
    'grok-4-fast-reasoning': { name: 'Grok 4 Fast Reasoning', provider: 'xai', isThinkingModel: true },
    'grok-4-fast-non-reasoning': { name: 'Grok 4 Fast Non Reasoning', provider: 'xai' }
  },
  google: {
    'gemini-2.5-pro': { name: 'Gemini 2.5 Pro', provider: 'google', isThinkingModel: true },
    'gemini-flash-latest': { name: 'Gemini Flash Latest', provider: 'google' },
    'gemini-flash-lite-latest': { name: 'Gemini Flash Lite Latest', provider: 'google' }
  },
  ollama: {}
};

// Function to get all models including dynamically discovered Ollama models
function getAllModels() {
  return { ...MODELS.openai, ...MODELS.anthropic, ...MODELS.xai, ...MODELS.google, ...MODELS.ollama };
}

const ALL_MODELS = getAllModels();

async function setupWizard() {
  console.log(chalk.blue('\n🚀 Welcome to promptx!'));
  console.log(chalk.gray('Let\'s set up your AI model preferences.\n'));
  
  // Provider selection first
  const { provider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Which AI provider would you like to use?',
      choices: [
        { name: '🤖 OpenAI (Best coding: GPT-5 74.9% SWE-bench)', value: 'openai' },
        { name: '🧠 Anthropic (Fastest: Haiku 4.5, Deep reasoning: Opus 4.1)', value: 'anthropic' },
        { name: '🚀 xAI (2M context Grok 4, Coding: Grok Code Fast)', value: 'xai' },
        { name: '🌟 Google (1M context, Best price/perf: Flash)', value: 'google' },
        { name: '🦙 Ollama (Local models)', value: 'ollama' }
      ]
    }
  ]);
  
  // Model selection based on provider
  let modelChoices = [];
  if (provider === 'openai') {
    modelChoices = [
      { name: 'GPT-5 (Best coding: 74.9% SWE-bench)', value: 'gpt-5' },
      { name: 'GPT-5 Mini (Balanced: 71% coding, 2× faster)', value: 'gpt-5-mini' },
      { name: 'GPT-5 Nano (Fastest: 3× speed, lowest cost)', value: 'gpt-5-nano' }
    ];
  } else if (provider === 'anthropic') {
    modelChoices = [
      { name: 'Claude Sonnet 4.5 (Top coding, 1M context)', value: 'claude-sonnet-4-5' },
      { name: 'Claude Haiku 4.5 (Fastest, 1/3 cost, 90% quality)', value: 'claude-haiku-4-5' },
      { name: 'Claude Opus 4.1 (Deepest reasoning: 74.5% SWE)', value: 'claude-opus-4-1' }
    ];
  } else if (provider === 'xai') {
    modelChoices = [
      { name: 'Grok Code Fast 1 (Coding specialist: 70.8%)', value: 'grok-code-fast-1' },
      { name: 'Grok 4 Fast Reasoning (2M context, deep thinking)', value: 'grok-4-fast-reasoning' },
      { name: 'Grok 4 Fast Non Reasoning (Fastest, cheapest)', value: 'grok-4-fast-non-reasoning' }
    ];
  } else if (provider === 'ollama') {
    const ollamaResult = await discoverOllamaModels();

    // Handle different error scenarios
    if (ollamaResult.error) {
      switch (ollamaResult.error) {
        case 'not_installed':
          showOllamaNotInstalledError();
          break;
        case 'service_not_running':
          showOllamaServiceNotRunningError();
          break;
        case 'no_models':
          showOllamaNoModelsError();
          break;
        default:
          console.log(chalk.red('\n❌ Error accessing Ollama:'), ollamaResult.details || 'Unknown error');
          console.log(chalk.gray('Please check your Ollama installation and try again.'));
      }

      console.log(chalk.yellow('\n🔄 Would you like to choose a different provider instead?'));
      const { useOtherProvider } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useOtherProvider',
          message: 'Select a different AI provider?',
          default: true
        }
      ]);

      if (useOtherProvider) {
        // Restart provider selection without Ollama
        const { newProvider } = await inquirer.prompt([
          {
            type: 'list',
            name: 'newProvider',
            message: 'Which AI provider would you like to use?',
            choices: [
              { name: '🤖 OpenAI (GPT-5, GPT-5 Mini, GPT-5 Nano)', value: 'openai' },
              { name: '🧠 Anthropic (Claude Sonnet 4.5, Claude Haiku 4.5, Claude Opus 4.1)', value: 'anthropic' },
              { name: '🚀 xAI (Grok Code Fast 1, Grok 4 Fast Reasoning)', value: 'xai' },
              { name: '🌟 Google (Gemini 2.5 Pro, Gemini Flash Latest)', value: 'google' }
            ]
          }
        ]);

        // Recursively call setupWizard with the new provider
        provider = newProvider;

        // Set model choices based on new provider
        if (provider === 'openai') {
          modelChoices = [
            { name: 'GPT-5 (Most capable)', value: 'gpt-5' },
            { name: 'GPT-5 Mini (Efficient and fast)', value: 'gpt-5-mini' },
            { name: 'GPT-5 Nano (Ultra-fast, lightweight)', value: 'gpt-5-nano' }
          ];
        } else if (provider === 'anthropic') {
          modelChoices = [
            { name: 'Claude Sonnet 4.5 (Most powerful, best coding)', value: 'claude-sonnet-4-5' },
            { name: 'Claude Haiku 4.5 (Fast and efficient)', value: 'claude-haiku-4-5' },
            { name: 'Claude Opus 4.1 (Balanced performance)', value: 'claude-opus-4-1' }
          ];
        } else if (provider === 'xai') {
          modelChoices = [
            { name: 'Grok Code Fast 1 (Code-focused, fast)', value: 'grok-code-fast-1' },
            { name: 'Grok 4 Fast Reasoning (Thinking model, intelligent)', value: 'grok-4-fast-reasoning' },
            { name: 'Grok 4 Fast Non Reasoning (Fast responses)', value: 'grok-4-fast-non-reasoning' }
          ];
        } else {
          modelChoices = [
            { name: 'Gemini 2.5 Pro (Thinking model, most capable)', value: 'gemini-2.5-pro' },
            { name: 'Gemini Flash Latest (Fast, efficient)', value: 'gemini-flash-latest' },
            { name: 'Gemini Flash Lite Latest (Ultra-fast, lightweight)', value: 'gemini-flash-lite-latest' }
          ];
        }
      } else {
        console.log(chalk.gray('\nExiting setup. You can run promptx again when Ollama is ready.'));
        process.exit(0);
      }
    } else {
      // Success - update MODELS.ollama with discovered models
      MODELS.ollama = ollamaResult;

      // Show recommendation message before model selection
      console.log(chalk.yellow('\n💡 For best prompt refinement quality, use models with 7B+ parameters.'));
      console.log(chalk.gray('   Recommended: llama3 (8B), mistral (7B), codellama (7B+)'));
      console.log(chalk.gray('   Smaller models may produce poor results.\n'));

      modelChoices = Object.entries(ollamaResult).map(([key, model]) => ({
        name: `${model.name} (${model.fullName})`,
        value: key
      }));
    }
  } else {
    modelChoices = [
      { name: 'Gemini 2.5 Pro (Best reasoning, 1M context)', value: 'gemini-2.5-pro' },
      { name: 'Gemini Flash Latest (Best price/performance)', value: 'gemini-flash-latest' },
      { name: 'Gemini Flash Lite Latest (Fastest, lowest cost)', value: 'gemini-flash-lite-latest' }
    ];
  }
  
  const { selectedModel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedModel',
      message: 'Select your model:',
      choices: modelChoices
    }
  ]);
  
  // API key setup based on provider
  let apiKey;
  if (provider === 'ollama') {
    // Ollama doesn't need an API key
    apiKey = null;
  } else if (provider === 'openai') {
    console.log(chalk.yellow('\nYou\'ll need an OpenAI API key'));
    console.log(chalk.gray('Get one at: https://platform.openai.com/api-keys\n'));
    
    const { openaiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'openaiKey',
        message: 'Enter your OpenAI API key:',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return 'API key cannot be empty';
          }
          if (!input.startsWith('sk-')) {
            return 'Invalid API key format. OpenAI API keys start with "sk-"';
          }
          return true;
        }
      }
    ]);
    apiKey = openaiKey;
    config.set('openai_api_key', apiKey);
  } else if (provider === 'anthropic') {
    console.log(chalk.yellow('\nYou\'ll need an Anthropic API key'));
    console.log(chalk.gray('Get one at: https://console.anthropic.com/settings/keys\n'));
    
    const { anthropicKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'anthropicKey',
        message: 'Enter your Anthropic API key:',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return 'API key cannot be empty';
          }
          if (!input.startsWith('sk-ant-')) {
            return 'Invalid API key format. Anthropic API keys start with "sk-ant-"';
          }
          return true;
        }
      }
    ]);
    apiKey = anthropicKey;
    config.set('anthropic_api_key', apiKey);
  } else if (provider === 'xai') {
    console.log(chalk.yellow('\nYou\'ll need an xAI API key'));
    console.log(chalk.gray('Get one at: https://console.x.ai/\n'));
    
    const { xaiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'xaiKey',
        message: 'Enter your xAI API key:',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return 'API key cannot be empty';
          }
          if (!input.startsWith('xai-')) {
            return 'Invalid API key format. xAI API keys start with "xai-"';
          }
          return true;
        }
      }
    ]);
    apiKey = xaiKey;
    config.set('xai_api_key', apiKey);
  } else {
    console.log(chalk.yellow('\nYou\'ll need a Google AI API key'));
    console.log(chalk.gray('Get one at: https://aistudio.google.com/apikey\n'));
    
    const { googleKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'googleKey',
        message: 'Enter your Google AI API key:',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return 'API key cannot be empty';
          }
          return true;
        }
      }
    ]);
    apiKey = googleKey;
    config.set('google_api_key', apiKey);
  }
  
  config.set('selected_model', selectedModel);
  config.set('setup_complete', true);
  
  const modelInfo = getAllModels()[selectedModel];
  console.log(chalk.green('\n✅ Setup complete!'));
  console.log(chalk.gray(`Provider: ${provider.toUpperCase()}`));
  console.log(chalk.gray(`Model: ${modelInfo.name}`));
  console.log(chalk.gray('You can change your model anytime by typing /model\n'));
}

async function getOrSetupConfig() {
  const setupComplete = config.get('setup_complete');
  
  if (!setupComplete) {
    await setupWizard();
  }
  
  const selectedModel = config.get('selected_model') || 'gpt-5';
  let modelInfo = getAllModels()[selectedModel];

  // If model not found and it might be an Ollama model, try to discover Ollama models
  if (!modelInfo && selectedModel) {
    const ollamaResult = await discoverOllamaModels();
    if (!ollamaResult.error) {
      MODELS.ollama = ollamaResult;
      modelInfo = getAllModels()[selectedModel];
    }
  }

  // If still not found, fall back to default
  if (!modelInfo) {
    console.log(chalk.yellow(`Model ${selectedModel} not found. Falling back to GPT-5.`));
    config.set('selected_model', 'gpt-5');
    modelInfo = getAllModels()['gpt-5'];
  }

  const provider = modelInfo.provider;
  
  let apiKey;
  if (provider === 'ollama') {
    // Ollama doesn't need an API key
    apiKey = null;
  } else if (provider === 'openai') {
    apiKey = config.get('openai_api_key');
    if (!apiKey) {
      console.log(chalk.yellow('OpenAI API key not found. Running setup...'));
      await setupWizard();
      apiKey = config.get('openai_api_key');
    }
  } else if (provider === 'anthropic') {
    apiKey = config.get('anthropic_api_key');
    if (!apiKey) {
      console.log(chalk.yellow('Anthropic API key not found. Running setup...'));
      await setupWizard();
      apiKey = config.get('anthropic_api_key');
    }
  } else if (provider === 'xai') {
    apiKey = config.get('xai_api_key');
    if (!apiKey) {
      console.log(chalk.yellow('xAI API key not found. Running setup...'));
      await setupWizard();
      apiKey = config.get('xai_api_key');
    }
  } else {
    apiKey = config.get('google_api_key');
    if (!apiKey) {
      console.log(chalk.yellow('Google AI API key not found. Running setup...'));
      await setupWizard();
      apiKey = config.get('google_api_key');
    }
  }
  
  return { selectedModel, modelInfo, apiKey };
}

async function changeModel() {
  console.log(chalk.blue('\n🔄 Change Model'));
  
  const currentModel = config.get('selected_model') || 'gpt-5';
  const currentModelInfo = getAllModels()[currentModel] || getAllModels()['gpt-5'];
  
  console.log(chalk.gray(`Current model: ${currentModelInfo.name}\n`));
  
  // Provider selection
  const { provider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Which AI provider would you like to use?',
      choices: [
        { name: '🤖 OpenAI (Best coding: GPT-5 74.9% SWE-bench)', value: 'openai' },
        { name: '🧠 Anthropic (Fastest: Haiku 4.5, Deep reasoning: Opus 4.1)', value: 'anthropic' },
        { name: '🚀 xAI (2M context Grok 4, Coding: Grok Code Fast)', value: 'xai' },
        { name: '🌟 Google (1M context, Best price/perf: Flash)', value: 'google' },
        { name: '🦙 Ollama (Local models)', value: 'ollama' }
      ]
    }
  ]);
  
  // Model selection based on provider
  let modelChoices = [];
  if (provider === 'openai') {
    modelChoices = [
      { name: 'GPT-5 (Best coding: 74.9% SWE-bench)', value: 'gpt-5' },
      { name: 'GPT-5 Mini (Balanced: 71% coding, 2× faster)', value: 'gpt-5-mini' },
      { name: 'GPT-5 Nano (Fastest: 3× speed, lowest cost)', value: 'gpt-5-nano' }
    ];
  } else if (provider === 'anthropic') {
    modelChoices = [
      { name: 'Claude Sonnet 4.5 (Top coding, 1M context)', value: 'claude-sonnet-4-5' },
      { name: 'Claude Haiku 4.5 (Fastest, 1/3 cost, 90% quality)', value: 'claude-haiku-4-5' },
      { name: 'Claude Opus 4.1 (Deepest reasoning: 74.5% SWE)', value: 'claude-opus-4-1' }
    ];
  } else if (provider === 'xai') {
    modelChoices = [
      { name: 'Grok Code Fast 1 (Coding specialist: 70.8%)', value: 'grok-code-fast-1' },
      { name: 'Grok 4 Fast Reasoning (2M context, deep thinking)', value: 'grok-4-fast-reasoning' },
      { name: 'Grok 4 Fast Non Reasoning (Fastest, cheapest)', value: 'grok-4-fast-non-reasoning' }
    ];
  } else if (provider === 'ollama') {
    const ollamaResult = await discoverOllamaModels();

    // Handle different error scenarios
    if (ollamaResult.error) {
      switch (ollamaResult.error) {
        case 'not_installed':
          showOllamaNotInstalledError();
          break;
        case 'service_not_running':
          showOllamaServiceNotRunningError();
          break;
        case 'no_models':
          showOllamaNoModelsError();
          break;
        default:
          console.log(chalk.red('\n❌ Error accessing Ollama:'), ollamaResult.details || 'Unknown error');
          console.log(chalk.gray('Please check your Ollama installation and try again.'));
      }

      console.log(chalk.yellow('\n🔄 Would you like to choose a different provider instead?'));
      const { useOtherProvider } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useOtherProvider',
          message: 'Select a different AI provider?',
          default: true
        }
      ]);

      if (useOtherProvider) {
        // Restart provider selection without Ollama
        const { newProvider } = await inquirer.prompt([
          {
            type: 'list',
            name: 'newProvider',
            message: 'Which AI provider would you like to use?',
            choices: [
              { name: '🤖 OpenAI (GPT-5, GPT-5 Mini, GPT-5 Nano)', value: 'openai' },
              { name: '🧠 Anthropic (Claude Sonnet 4.5, Claude Haiku 4.5, Claude Opus 4.1)', value: 'anthropic' },
              { name: '🚀 xAI (Grok Code Fast 1, Grok 4 Fast Reasoning)', value: 'xai' },
              { name: '🌟 Google (Gemini 2.5 Pro, Gemini Flash Latest)', value: 'google' }
            ]
          }
        ]);

        // Update provider and set model choices
        provider = newProvider;

        if (provider === 'openai') {
          modelChoices = [
            { name: 'GPT-5 (Most capable)', value: 'gpt-5' },
            { name: 'GPT-5 Mini (Efficient and fast)', value: 'gpt-5-mini' },
            { name: 'GPT-5 Nano (Ultra-fast, lightweight)', value: 'gpt-5-nano' }
          ];
        } else if (provider === 'anthropic') {
          modelChoices = [
            { name: 'Claude Sonnet 4.5 (Most powerful, best coding)', value: 'claude-sonnet-4-5' },
            { name: 'Claude Haiku 4.5 (Fast and efficient)', value: 'claude-haiku-4-5' },
            { name: 'Claude Opus 4.1 (Balanced performance)', value: 'claude-opus-4-1' }
          ];
        } else if (provider === 'xai') {
          modelChoices = [
            { name: 'Grok Code Fast 1 (Code-focused, fast)', value: 'grok-code-fast-1' },
            { name: 'Grok 4 Fast Reasoning (Thinking model, intelligent)', value: 'grok-4-fast-reasoning' },
            { name: 'Grok 4 Fast Non Reasoning (Fast responses)', value: 'grok-4-fast-non-reasoning' }
          ];
        } else {
          modelChoices = [
            { name: 'Gemini 2.5 Pro (Thinking model, most capable)', value: 'gemini-2.5-pro' },
            { name: 'Gemini Flash Latest (Fast, efficient)', value: 'gemini-flash-latest' },
            { name: 'Gemini Flash Lite Latest (Ultra-fast, lightweight)', value: 'gemini-flash-lite-latest' }
          ];
        }
      } else {
        console.log(chalk.gray('\nReturning to current model. You can try again when Ollama is ready.'));
        return;
      }
    } else {
      // Success - update MODELS.ollama with discovered models
      MODELS.ollama = ollamaResult;

      // Show recommendation message before model selection
      console.log(chalk.yellow('\n💡 For best prompt refinement quality, use models with 7B+ parameters.'));
      console.log(chalk.gray('   Recommended: llama3 (8B), mistral (7B), codellama (7B+)'));
      console.log(chalk.gray('   Smaller models may produce poor results.\n'));

      modelChoices = Object.entries(ollamaResult).map(([key, model]) => ({
        name: `${model.name} (${model.fullName})`,
        value: key
      }));
    }
  } else {
    modelChoices = [
      { name: 'Gemini 2.5 Pro (Best reasoning, 1M context)', value: 'gemini-2.5-pro' },
      { name: 'Gemini Flash Latest (Best price/performance)', value: 'gemini-flash-latest' },
      { name: 'Gemini Flash Lite Latest (Fastest, lowest cost)', value: 'gemini-flash-lite-latest' }
    ];
  }
  
  const { selectedModel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedModel',
      message: 'Select your model:',
      choices: modelChoices
    }
  ]);
  
  // Check if we need API key for this provider
  if (provider === 'ollama') {
    // Ollama doesn't need an API key
  } else if (provider === 'openai' && !config.get('openai_api_key')) {
    console.log(chalk.yellow('\nYou need an OpenAI API key for this model.'));
    const { openaiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'openaiKey',
        message: 'Enter your OpenAI API key:',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return 'API key cannot be empty';
          }
          if (!input.startsWith('sk-')) {
            return 'Invalid API key format. OpenAI API keys start with "sk-"';
          }
          return true;
        }
      }
    ]);
    config.set('openai_api_key', openaiKey);
  } else if (provider === 'anthropic' && !config.get('anthropic_api_key')) {
    console.log(chalk.yellow('\nYou need an Anthropic API key for this model.'));
    const { anthropicKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'anthropicKey',
        message: 'Enter your Anthropic API key:',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return 'API key cannot be empty';
          }
          if (!input.startsWith('sk-ant-')) {
            return 'Invalid API key format. Anthropic API keys start with "sk-ant-"';
          }
          return true;
        }
      }
    ]);
    config.set('anthropic_api_key', anthropicKey);
  } else if (provider === 'xai' && !config.get('xai_api_key')) {
    console.log(chalk.yellow('\nYou need an xAI API key for this model.'));
    const { xaiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'xaiKey',
        message: 'Enter your xAI API key:',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return 'API key cannot be empty';
          }
          if (!input.startsWith('xai-')) {
            return 'Invalid API key format. xAI API keys start with "xai-"';
          }
          return true;
        }
      }
    ]);
    config.set('xai_api_key', xaiKey);
  } else if (provider === 'google' && !config.get('google_api_key')) {
    console.log(chalk.yellow('\nYou need a Google AI API key for this model.'));
    const { googleKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'googleKey',
        message: 'Enter your Google AI API key:',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return 'API key cannot be empty';
          }
          return true;
        }
      }
    ]);
    config.set('google_api_key', googleKey);
  }
  
  config.set('selected_model', selectedModel);
  const modelInfo = getAllModels()[selectedModel];
  console.log(chalk.green(`\n✅ Switched to ${modelInfo.name}`));
}

async function refinePrompt(messyPrompt, selectedModel, apiKey) {
  const modelInfo = getAllModels()[selectedModel];
  const spinner = ora(`Refining your prompt with ${modelInfo.name}...`).start();
  
  const systemPrompt = `You are promptx, an expert prompt engineering tool created by Luka Loehr (https://github.com/luka-loehr). You are part of the @lukaloehr/promptx npm package - a CLI tool that transforms messy, informal developer prompts into meticulously crafted instructions for AI coding assistants.
CRITICAL BEHAVIOR RULES:
If the user is just chatting, asking about you, or making conversation (e.g., "how are you", "who made you", "what's your npm package", etc.), respond conversationally WITHOUT trying to create a prompt. Answer naturally and always end with: "I can help you with structuring messy prompts into streamlined prompts for AI coding agents like Codex."
For actual prompt requests, follow these rules:
ABSOLUTE RULES:

Output ONLY the refined prompt - no explanations, no meta-commentary
NEVER include code, snippets, or implementation examples
NEVER say "Here's the refined prompt:" or similar phrases
Create prompts that instruct AI to generate code, not prompts containing code

PROMPT ENGINEERING PRINCIPLES:

Ultra-Specific Objectives

State the exact goal in the first sentence
Define success criteria explicitly
Specify the development context (language, framework, environment, package manager)
Include version requirements and compatibility needs


Comprehensive Technical Requirements

List all functional requirements with bullet points
Detail edge cases and error scenarios
Specify performance expectations and constraints
Include security considerations when relevant
Define input/output formats precisely


Implementation Guidelines

Describe architectural preferences (patterns, structures)
Specify coding style and conventions
Define error handling strategies
Include testing requirements
Mention documentation needs (inline comments, JSDoc, etc.)


AI-Optimized Structure

Use clear section headers for complex prompts
Number multi-step processes
Use imperative mood ("Create", "Implement", "Design")
Front-load critical requirements
End with expected deliverables


Advanced Prompt Techniques

Include "think step-by-step" for complex logic
Specify intermediate outputs for debugging
Request explanations for non-obvious implementations
Define success metrics and validation steps



Transform even the messiest developer thoughts into prompts that produce production-ready code from AI assistants. Make every prompt detailed, unambiguous, and result-oriented.`;
  
  try {
    let refinedPrompt;
    
    if (modelInfo.provider === 'openai') {
      const openai = new OpenAI({ apiKey });
      
      // Use max_completion_tokens for newer models
      const completionParams = {
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: messyPrompt }
        ],
        stream: true
      };
      
      // GPT-5 models use max_completion_tokens and don't support custom temperature
      if (selectedModel.startsWith('gpt-5')) {
        completionParams.max_completion_tokens = 2000;
        // GPT-5 only supports default temperature (1)
      } else {
        completionParams.max_tokens = 2000;
        completionParams.temperature = 0.3;
      }
      
      spinner.stop();
      console.log('\n\n' + chalk.gray('─'.repeat(80)));
      console.log(chalk.green('REFINED PROMPT:'));
      console.log(chalk.gray('─'.repeat(80)) + '\n');
      
      // Show refining spinner for all models
      const thinkingSpinner = ora(`Refining your prompt with ${modelInfo.name}...`).start();
      
      const streamWriter = createStreamWriter();
      const stream = await openai.chat.completions.create(completionParams);
      refinedPrompt = '';
      let firstChunk = true;
      
      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          // Stop thinking spinner on first chunk
          if (firstChunk) {
            thinkingSpinner.stop();
            firstChunk = false;
          }
          
          const content = chunk.choices[0].delta.content;
          streamWriter.write(content);
          refinedPrompt += content;
        }
      }
      streamWriter.flush();
      
      console.log('\n' + chalk.gray('─'.repeat(80)) + '\n\n');
    } else if (modelInfo.provider === 'anthropic') {
      const anthropic = new Anthropic({ apiKey });
      
      // Claude Opus 4.1 has 32K max tokens, others have 64K
      const maxTokens = selectedModel === 'claude-opus-4-1' ? 32000 : 64000;
      
      const stream = await anthropic.messages.create({
        model: selectedModel,
        messages: [{ role: 'user', content: messyPrompt }],
        system: systemPrompt,
        temperature: 0.3,
        max_tokens: maxTokens,
        stream: true
      });
      
      spinner.stop();
      console.log('\n\n' + chalk.gray('─'.repeat(80)));
      console.log(chalk.green('REFINED PROMPT:'));
      console.log(chalk.gray('─'.repeat(80)) + '\n');
      
      // Show refining spinner for all models
      const thinkingSpinner = ora(`Refining your prompt with ${modelInfo.name}...`).start();
      
      const streamWriter = createStreamWriter();
      refinedPrompt = '';
      let firstChunk = true;
      
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
          // Stop thinking spinner on first chunk
          if (firstChunk) {
            thinkingSpinner.stop();
            firstChunk = false;
          }
          
          const content = chunk.delta.text;
          streamWriter.write(content);
          refinedPrompt += content;
        }
      }
      streamWriter.flush();
      
      console.log('\n' + chalk.gray('─'.repeat(80)) + '\n\n');
    } else if (modelInfo.provider === 'xai') {
      // xAI is compatible with OpenAI's API
      const xai = new OpenAI({ 
        apiKey,
        baseURL: 'https://api.x.ai/v1'
      });
      
      const completionParams = {
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: messyPrompt }
        ],
        stream: true
      };
      
      // Grok 4 Fast Reasoning is a reasoning model - no temperature/frequency/presence penalties
      // Other Grok models support standard parameters
      if (selectedModel === 'grok-4-fast-reasoning') {
        // Reasoning model
        completionParams.max_tokens = 100000; // Max 100k tokens for Grok models
      } else {
        // Standard models
        completionParams.temperature = 0.3;
        completionParams.max_tokens = 2000;
      }
      
      spinner.stop();
      console.log('\n\n' + chalk.gray('─'.repeat(80)));
      console.log(chalk.green('REFINED PROMPT:'));
      console.log(chalk.gray('─'.repeat(80)) + '\n');
      
      // Show refining spinner for all models
      const thinkingSpinner = ora(`Refining your prompt with ${modelInfo.name}...`).start();
      
      const streamWriter = createStreamWriter();
      const stream = await xai.chat.completions.create(completionParams);
      refinedPrompt = '';
      let firstChunk = true;
      
      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          // Stop thinking spinner on first chunk
          if (firstChunk) {
            thinkingSpinner.stop();
            firstChunk = false;
          }
          
          const content = chunk.choices[0].delta.content;
          streamWriter.write(content);
          refinedPrompt += content;
        }
      }
      streamWriter.flush();
      
      console.log('\n' + chalk.gray('─'.repeat(80)) + '\n\n');
    } else if (modelInfo.provider === 'google') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: selectedModel });
      
      // Combine system prompt and user prompt for Google AI
      const fullPrompt = `${systemPrompt}\n\nUser Prompt: ${messyPrompt}`;
      
      spinner.stop();
      console.log('\n\n' + chalk.gray('─'.repeat(80)));
      console.log(chalk.green('REFINED PROMPT:'));
      console.log(chalk.gray('─'.repeat(80)) + '\n');
      
      // Show refining spinner for all models
      const thinkingSpinner = ora(`Refining your prompt with ${modelInfo.name}...`).start();
      
      const streamWriter = createStreamWriter();
      const result = await model.generateContentStream(fullPrompt);
      refinedPrompt = '';
      let firstChunk = true;
      
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          // Stop thinking spinner on first chunk
          if (firstChunk) {
            thinkingSpinner.stop();
            firstChunk = false;
          }
          
          streamWriter.write(text);
          refinedPrompt += text;
        }
      }
      streamWriter.flush();

      console.log('\n' + chalk.gray('─'.repeat(80)) + '\n\n');
    } else if (modelInfo.provider === 'ollama') {
      // Ollama uses OpenAI-compatible API
      try {
        const ollama = new OpenAI({
          apiKey: 'ollama', // Ollama doesn't validate API keys
          baseURL: 'http://localhost:11434/v1'
        });

        const completionParams = {
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: messyPrompt }
          ],
          stream: true,
          temperature: 0.3,
          max_tokens: 2000
        };

        spinner.stop();
        console.log('\n\n' + chalk.gray('─'.repeat(80)));
        console.log(chalk.green('REFINED PROMPT:'));
        console.log(chalk.gray('─'.repeat(80)) + '\n');

        // Show refining spinner for all models
        const thinkingSpinner = ora(`Refining your prompt with ${modelInfo.name}...`).start();

        const streamWriter = createStreamWriter();
        const stream = await ollama.chat.completions.create(completionParams);
        refinedPrompt = '';
        let firstChunk = true;

        for await (const chunk of stream) {
          if (chunk.choices[0]?.delta?.content) {
            // Stop thinking spinner on first chunk
            if (firstChunk) {
              thinkingSpinner.stop();
              firstChunk = false;
            }
            
            const content = chunk.choices[0].delta.content;
            streamWriter.write(content);
            refinedPrompt += content;
          }
        }
        streamWriter.flush();

        console.log('\n' + chalk.gray('─'.repeat(80)) + '\n\n');
      } catch (ollamaError) {
        spinner.fail('Failed to refine prompt with Ollama');

        // Handle specific Ollama errors
        if (ollamaError.code === 'ECONNREFUSED' || ollamaError.message.includes('ECONNREFUSED')) {
          showOllamaConnectionError();
        } else if (ollamaError.status === 404 || ollamaError.message.includes('model not found')) {
          console.log(chalk.red('\n❌ Model not found in Ollama.'));
          console.log(chalk.gray(`The model "${selectedModel}" is not available locally.`));
          console.log(chalk.yellow('\n📦 To download this model:'));
          console.log(chalk.cyan(`  ollama pull ${selectedModel}`));
          console.log(chalk.yellow('\n💡 For best prompt refinement quality, use 7B+ models:'));
          console.log(chalk.cyan('  ollama pull llama3        ') + chalk.gray('# 8B parameters, excellent quality'));
          console.log(chalk.cyan('  ollama pull mistral       ') + chalk.gray('# 7B parameters, good performance'));
          console.log(chalk.gray('\n💡 Or choose a different model with: ') + chalk.cyan('/model'));
        } else if (ollamaError.message.includes('insufficient memory') || ollamaError.message.includes('out of memory')) {
          console.log(chalk.red('\n❌ Insufficient memory to run the model.'));
          console.log(chalk.gray('The selected model requires more RAM than available.'));
          console.log(chalk.yellow('\n💡 Try:'));
          console.log(chalk.white('  • Close other applications to free memory'));
          console.log(chalk.white('  • Use llama3:8b or mistral:7b (good quality, lower memory)'));
          console.log(chalk.yellow('  ⚠️  Avoid models smaller than 7B - they produce poor results'));
          console.log(chalk.white('  • Switch to a cloud provider with ') + chalk.cyan('/model'));
        } else {
          console.log(chalk.red('\n❌ Ollama API error:'), ollamaError.message);
          console.log(chalk.gray('\nThis might be a temporary issue. Please try:'));
          console.log(chalk.yellow('\n🔧 Troubleshooting:'));
          console.log(chalk.white('  1. ') + chalk.cyan('ollama serve') + chalk.gray(' - Restart Ollama service'));
          console.log(chalk.white('  2. ') + chalk.cyan('ollama list') + chalk.gray(' - Check available models'));
          console.log(chalk.white('  3. Try a different model with ') + chalk.cyan('/model'));
        }

        console.log(chalk.yellow('\n🔄 You can switch to a cloud provider for now:'));
        console.log(chalk.cyan('  /model') + chalk.gray(' - Choose OpenAI, Anthropic, xAI, or Google'));

        throw ollamaError; // Re-throw to trigger main error handler
      }
    }

    return refinedPrompt;
  } catch (error) {
    // Only show generic error handling if spinner is still running
    // (Ollama errors handle their own spinner.fail())
    if (spinner.isSpinning) {
      spinner.fail('Failed to refine prompt');
    }

    // Handle different error types
    if (error.status === 401) {
      console.log(chalk.red('Invalid API key. Please run "promptx reset" to update your API key.'));
    } else if (error.status === 429) {
      console.log(chalk.red('Rate limit exceeded. Please try again later.'));
    } else if (modelInfo.provider === 'ollama') {
      // Ollama errors are already handled above, just show fallback suggestion
      console.log(chalk.gray('\n💡 Consider using a cloud provider as a backup:'));
      console.log(chalk.cyan('  /model') + chalk.gray(' - Switch to OpenAI, Anthropic, xAI, or Google'));
    } else {
      console.log(chalk.red('Error:', error.message));

      // Provide helpful suggestions based on provider
      if (modelInfo.provider === 'openai') {
        console.log(chalk.gray('\n💡 Check your OpenAI API key and account status.'));
      } else if (modelInfo.provider === 'anthropic') {
        console.log(chalk.gray('\n💡 Check your Anthropic API key and account status.'));
      } else if (modelInfo.provider === 'xai') {
        console.log(chalk.gray('\n💡 Check your xAI API key and account status.'));
      } else if (modelInfo.provider === 'google') {
        console.log(chalk.gray('\n💡 Check your Google AI API key and account status.'));
      }
    }

    process.exit(1);
  }
}

function showHelp() {
  console.log(chalk.blue('\n📚 promptx Help'));
  console.log(chalk.gray('─'.repeat(50)));
  
  console.log(chalk.green('\n🚀 Basic Usage:'));
  console.log(chalk.white('  promptx                    ') + chalk.gray('- Interactive mode'));
  console.log(chalk.white('  promptx "your prompt"      ') + chalk.gray('- Direct mode'));
  
  console.log(chalk.green('\n⚡ Commands:'));
  console.log(chalk.white('  /help                      ') + chalk.gray('- Show this help menu'));
  console.log(chalk.white('  /model                     ') + chalk.gray('- Switch AI models'));
  console.log(chalk.white('  /whats-new                 ') + chalk.gray('- See latest updates'));
  console.log(chalk.white('  promptx reset              ') + chalk.gray('- Reset configuration'));
  
  console.log(chalk.green('\n🤖 Supported Providers:'));
  console.log(chalk.white('  • OpenAI    ') + chalk.gray('- GPT-5 (74.9% coding), Mini (71%, 2× faster), Nano (fastest)'));
  console.log(chalk.white('  • Anthropic ') + chalk.gray('- Sonnet 4.5 (best coding), Haiku 4.5 (fastest), Opus 4.1 (74.5% coding)'));
  console.log(chalk.white('  • xAI       ') + chalk.gray('- Grok Code Fast (70.8% coding), Grok 4 (2M context, reasoning)'));
  console.log(chalk.white('  • Google    ') + chalk.gray('- Gemini Pro (best reasoning), Flash (price/perf), Flash Lite (fastest)'));
  console.log(chalk.white('  • Ollama    ') + chalk.gray('- Local models (llama3, mistral, etc.)'));
  
  console.log(chalk.green('\n💡 Tips:'));
  console.log(chalk.gray('  • First run will guide you through setup'));
  console.log(chalk.gray('  • API keys are stored securely'));
  console.log(chalk.gray('  • Check for updates with update notifications'));
  
  console.log(chalk.gray('\n─'.repeat(50)));
  console.log(chalk.gray('Docs: https://github.com/luka-loehr/promptx-cli\n'));
}

function showWhatsNew() {
  console.log(chalk.blue('\n🎉 What\'s New in promptx v' + packageJson.version));
  console.log(chalk.gray('─'.repeat(50)));
  
  const updates = [
    {
      version: '1.3.0',
      changes: [
        '📚 Added /help command for quick reference',
        '🎯 Complete feature set for stable release',
        '📝 Comprehensive documentation updates',
        '🔧 Package configuration improvements'
      ]
    },
    {
      version: '1.2.1',
      changes: [
        '🔔 Automatic update notifications',
        '📦 Shows update command when new version available',
        '⏰ Daily update checks (non-intrusive)'
      ]
    },
    {
      version: '1.2.0',
      changes: [
        '🚀 xAI Grok support (Grok 3, 3 Mini, 4, 4 Heavy)',
        '🧠 Claude 2025 models (Sonnet 4, Opus 4)',
        '🤖 OpenAI 2025 models (O4 Mini, O3)',
        '📁 Provider-based model organization',
        '🎨 Improved setup wizard UX'
      ]
    },
    {
      version: '1.1.0',
      changes: [
        '🤖 Multi-model support (OpenAI + Anthropic)',
        '🔄 /model command to switch models',
        '✨ Interactive setup wizard',
        '📰 /whats-new command',
        '🔑 Multi-provider API key support'
      ]
    },
    {
      version: '1.0.x',
      changes: [
        '🎉 Initial release',
        '✨ Transform messy prompts to structured ones',
        '🎨 Beautiful CLI interface',
        '📦 Global npm package',
        '⚠️  Post-install warnings'
      ]
    }
  ];
  
  // Show all updates for stable release
  console.log(chalk.yellow('\n🌟 Stable Release - All Features:\n'));
  
  updates.forEach(update => {
    console.log(chalk.green(`v${update.version}:`));
    update.changes.forEach(change => {
      console.log(chalk.white(`  ${change}`));
    });
    console.log();
  });
  
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.gray('Docs: https://github.com/luka-loehr/promptx-cli\n'));
}

program
  .name('promptx')
  .description('Transform messy prompts into structured, clear prompts for AI agents')
  .version(packageJson.version);

program
  .command('reset')
  .description('Reset your configuration and API keys')
  .action(async () => {
    config.clear();
    console.log(chalk.green('Configuration has been reset. You\'ll go through setup next time.'));
  });

program
  .argument('[prompt...]', 'The messy prompt to refine')
  .action(async (promptParts) => {
    // Handle special commands
    if (promptParts && promptParts.length === 1) {
      const command = promptParts[0].toLowerCase();
      
      if (command === '/help') {
        showHelp();
        return;
      }
      
      if (command === '/model') {
        await changeModel();
        return;
      }
      
      if (command === '/whats-new' || command === '/whatsnew') {
        showWhatsNew();
        return;
      }
    }
    
    const { selectedModel, modelInfo, apiKey } = await getOrSetupConfig();
    
    let messyPrompt;
    
    if (promptParts && promptParts.length > 0) {
      messyPrompt = promptParts.join(' ');
    } else {
      console.log(chalk.gray(`Using ${modelInfo.name}\n`));
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'prompt',
          message: 'Enter your messy prompt:',
          validate: (input) => {
            if (!input || input.trim() === '') {
              return 'Prompt cannot be empty';
            }
            return true;
          }
        }
      ]);
      messyPrompt = answers.prompt;
      
      // Check for commands in interactive mode
      if (messyPrompt.toLowerCase() === '/help') {
        showHelp();
        return;
      }
      
      if (messyPrompt.toLowerCase() === '/model') {
        await changeModel();
        return;
      }
      
      if (messyPrompt.toLowerCase() === '/whats-new' || messyPrompt.toLowerCase() === '/whatsnew') {
        showWhatsNew();
        return;
      }
    }
    
    await refinePrompt(messyPrompt, selectedModel, apiKey);
  });

program.parse();