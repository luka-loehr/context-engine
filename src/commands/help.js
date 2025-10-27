import chalk from 'chalk';

export function showHelp() {
  console.log(chalk.blue('\n📚 promptx Help'));
  console.log(chalk.gray('─'.repeat(50)));
  
  console.log(chalk.green('\n🚀 Basic Usage:'));
  console.log(chalk.white('  promptx                    ') + chalk.gray('- Interactive mode'));
  console.log(chalk.white('  promptx "your prompt"      ') + chalk.gray('- Direct mode'));
  console.log(chalk.white('  promptx --pro              ') + chalk.gray('- Pro mode with project context'));
  
  console.log(chalk.green('\n⚡ Commands:'));
  console.log(chalk.white('  /help                      ') + chalk.gray('- Show this help menu'));
  console.log(chalk.white('  /model                     ') + chalk.gray('- Switch AI models'));
  console.log(chalk.white('  promptx reset              ') + chalk.gray('- Reset configuration'));
  
  console.log(chalk.green('\n🚀 Pro Mode:'));
  console.log(chalk.white('  --pro                      ') + chalk.gray('- Scans all project files'));
  console.log(chalk.gray('                               Sends file contents to AI for context-aware prompts'));
  console.log(chalk.gray('                               Requires confirmation before proceeding'));
  
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

