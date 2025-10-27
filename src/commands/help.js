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
  console.log(chalk.white('  /model                     ') + chalk.gray('- Switch models'));
  
  console.log(chalk.green('\n🔍 How It Works:'));
  console.log(chalk.gray('  • Automatically scans all project files'));
  console.log(chalk.gray('  • Understands your codebase architecture'));
  console.log(chalk.gray('  • Maintains conversation context'));
  console.log(chalk.gray('  • Answers follow-up questions'));
  
  console.log(chalk.green('\n🤖 Available Models:'));
  console.log(chalk.white('  • promptx-fast ') + chalk.gray('- Fastest, lowest cost'));
  console.log(chalk.white('  • promptx      ') + chalk.gray('- Fast & balanced (default)'));
  console.log(chalk.white('  • promptx-pro  ') + chalk.gray('- Most capable, 1M context'));
  
  console.log(chalk.green('\n🔑 Setup:'));
  console.log(chalk.gray('  Set your Google API key:'));
  console.log(chalk.white('  export GOOGLE_API_KEY="your-key"'));
  console.log(chalk.gray('  Get one at: https://aistudio.google.com/apikey'));
  
  console.log(chalk.green('\n💡 Example Questions:'));
  console.log(chalk.gray('  • "What does this project do?"'));
  console.log(chalk.gray('  • "How does the authentication work?"'));
  console.log(chalk.gray('  • "Where is the database configured?"'));
  console.log(chalk.gray('  • "Help me add a new feature to..."'));
  
  console.log(chalk.gray('\n─'.repeat(50)));
  console.log(chalk.gray('Docs: https://github.com/luka-loehr/promptx-cli\n'));
}

