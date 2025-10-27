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
  console.log('');
}

