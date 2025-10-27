import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

/**
 * Check if Ollama service is running
 */
export async function checkOllamaService() {
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

/**
 * Discover Ollama models with comprehensive error handling
 */
export async function discoverOllamaModels() {
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

/**
 * Show user-friendly Ollama error messages
 */
export function showOllamaNotInstalledError() {
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

export function showOllamaServiceNotRunningError() {
  console.log(chalk.red('\n❌ Ollama service is not running.'));
  console.log(chalk.gray('\nOllama is installed but the service needs to be started.'));
  console.log(chalk.yellow('\n🚀 To start Ollama:'));
  console.log(chalk.cyan('  ollama serve'));
  console.log(chalk.gray('\n💡 Or run Ollama in the background and try again.'));
}

export function showOllamaNoModelsError() {
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

export function showOllamaConnectionError() {
  console.log(chalk.red('\n❌ Cannot connect to Ollama API.'));
  console.log(chalk.gray('\nThe Ollama service may not be running or accessible.'));
  console.log(chalk.yellow('\n🔧 Troubleshooting steps:'));
  console.log(chalk.white('  1. ') + chalk.cyan('ollama serve') + chalk.gray(' - Start the Ollama service'));
  console.log(chalk.white('  2. ') + chalk.cyan('ollama list') + chalk.gray(' - Verify models are available'));
  console.log(chalk.white('  3. Check if port 11434 is available'));
  console.log(chalk.gray('\n💡 Ollama runs on http://localhost:11434 by default.'));
}

export function showOllamaRecommendation() {
  console.log(chalk.yellow('\n💡 For best prompt refinement quality, use models with 7B+ parameters.'));
  console.log(chalk.gray('   Recommended: llama3 (8B), mistral (7B), codellama (7B+)'));
  console.log(chalk.gray('   Smaller models may produce poor results.\n'));
}

