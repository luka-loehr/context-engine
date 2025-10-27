import chalk from 'chalk';

export function showHelp() {
  console.log(chalk.blue('\n📚 promptx - Codebase Assistant'));
  console.log(chalk.gray('─'.repeat(50)));
  
  console.log(chalk.green('\n🚀 Getting Started:'));
  console.log(chalk.white('  promptx                    ') + chalk.gray('- Start interactive chat session'));
  console.log(chalk.white('  promptx reset              ') + chalk.gray('- Reset all configuration'));
  
  console.log(chalk.green('\n💬 Chat Commands:'));
  console.log(chalk.white('  /help                      ') + chalk.gray('- Show this help menu'));
  console.log(chalk.white('  /exit                      ') + chalk.gray('- Exit chat session'));
  console.log(chalk.white('  /clear                     ') + chalk.gray('- Clear conversation history'));
  console.log(chalk.white('  /model                     ') + chalk.gray('- Switch models or update API keys'));
  
  console.log(chalk.green('\n🔍 How It Works:'));
  console.log(chalk.gray('  • Automatically scans all project files'));
  console.log(chalk.gray('  • Understands your codebase architecture'));
  console.log(chalk.gray('  • Maintains conversation context'));
  console.log(chalk.gray('  • Answers follow-up questions'));
  
  console.log(chalk.green('\n🤖 Supported AI Models:'));
  console.log(chalk.white('  • OpenAI    ') + chalk.gray('- GPT-5, Mini, Nano'));
  console.log(chalk.white('  • Anthropic ') + chalk.gray('- Claude Sonnet 4.5, Haiku 4.5, Opus 4.1'));
  console.log(chalk.white('  • xAI       ') + chalk.gray('- Grok Code Fast, Grok 4 Fast'));
  console.log(chalk.white('  • Google    ') + chalk.gray('- Gemini 2.5 Pro, Flash'));
  console.log(chalk.white('  • Ollama    ') + chalk.gray('- Local models (llama3, mistral, etc.)'));
  
  console.log(chalk.green('\n💡 Example Questions:'));
  console.log(chalk.gray('  • "What does this project do?"'));
  console.log(chalk.gray('  • "How does the authentication work?"'));
  console.log(chalk.gray('  • "Where is the database configured?"'));
  console.log(chalk.gray('  • "Help me add a new feature to..."'));
  
  console.log(chalk.gray('\n─'.repeat(50)));
  console.log(chalk.gray('Docs: https://github.com/luka-loehr/promptx-cli\n'));
}

