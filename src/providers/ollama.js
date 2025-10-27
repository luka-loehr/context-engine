import OpenAI from 'openai';
import { BaseProvider } from './base.js';
import chalk from 'chalk';
import { showOllamaConnectionError } from '../utils/ollama.js';

export class OllamaProvider extends BaseProvider {
  constructor(modelId) {
    super(null); // Ollama doesn't need an API key
    this.client = new OpenAI({
      apiKey: 'ollama', // Ollama doesn't validate API keys
      baseURL: 'http://localhost:11434/v1'
    });
    this.modelId = modelId;
  }

  async refinePrompt(messyPrompt, systemPrompt, onChunk) {
    try {
      const completionParams = {
        model: this.modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: messyPrompt }
        ],
        stream: true,
        temperature: 0.3,
        max_tokens: 2000
      };

      const stream = await this.client.chat.completions.create(completionParams);
      let refinedPrompt = '';

      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          const content = chunk.choices[0].delta.content;
          if (onChunk) onChunk(content);
          refinedPrompt += content;
        }
      }

      return refinedPrompt;
    } catch (ollamaError) {
      // Handle specific Ollama errors
      if (ollamaError.code === 'ECONNREFUSED' || ollamaError.message.includes('ECONNREFUSED')) {
        showOllamaConnectionError();
      } else if (ollamaError.status === 404 || ollamaError.message.includes('model not found')) {
        console.log(chalk.red('\n❌ Model not found in Ollama.'));
        console.log(chalk.gray(`The model "${this.modelId}" is not available locally.`));
        console.log(chalk.yellow('\n📦 To download this model:'));
        console.log(chalk.cyan(`  ollama pull ${this.modelId}`));
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

      throw ollamaError;
    }
  }
}

