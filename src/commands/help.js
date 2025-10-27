import chalk from 'chalk';

export function showHelp() {
  console.log('');
  console.log(chalk.cyan.bold('promptx'));
  console.log('');
  console.log(chalk.white('AI-powered codebase assistant'));
  console.log('');
  
  console.log(chalk.cyan('Commands:'));
  console.log('');
  console.log(chalk.gray('  promptx           Start interactive chat'));
  console.log(chalk.gray('  promptx reset     Reset configuration'));
  console.log('');
  
  console.log(chalk.cyan('Chat commands:'));
  console.log('');
  console.log(chalk.gray('  /help             Show available commands'));
  console.log(chalk.gray('  /exit             Exit chat session'));
  console.log(chalk.gray('  /clear            Clear conversation history'));
  console.log(chalk.gray('  /model            Switch AI model'));
  console.log('');
  
  console.log(chalk.cyan('Available models:'));
  console.log('');
  console.log(chalk.gray('  promptx-fast      Fastest, 1M context'));
  console.log(chalk.gray('  promptx           Balanced, 1M context (default)'));
  console.log(chalk.gray('  promptx-pro       Most capable, 1M context'));
  console.log(chalk.gray('  promptx-ultra     Ultra-fast, 2M context'));
  console.log('');
}

