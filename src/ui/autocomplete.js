import readline from 'readline';
import chalk from 'chalk';
import ansiEscapes from 'ansi-escapes';

/**
 * Custom autocomplete input with clean UI
 * Shows suggestions only when typing commands starting with /
 */
export async function autocompleteInput(promptLabel = 'You', showHint = false) {
  if (showHint) {
    console.log(chalk.gray('💡 Tip: Type /help, /exit, /clear, or /model for commands\n'));
  }

  const commands = ['/help', '/exit', '/clear', '/model'];
  
  return new Promise((resolve) => {
    let input = '';
    let cursorPosition = 0;
    let selectedIndex = 0;
    let suggestions = [];
    let showingSuggestions = false;

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });

    // Set raw mode to capture individual keystrokes
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    function updateSuggestions() {
      // Only show suggestions if input starts with / and has no space
      if (input.startsWith('/') && !input.includes(' ') && input.length > 0) {
        suggestions = commands.filter(cmd => cmd.startsWith(input));
        showingSuggestions = suggestions.length > 0;
        selectedIndex = 0;
      } else {
        suggestions = [];
        showingSuggestions = false;
      }
    }

    function render() {
      // Clear current line and suggestions
      process.stdout.write(ansiEscapes.cursorTo(0));
      process.stdout.write(ansiEscapes.eraseDown);

      // Render prompt and input
      process.stdout.write(chalk.white(`${promptLabel}: ${input}`));

      // Render suggestions if any
      if (showingSuggestions && suggestions.length > 0) {
        process.stdout.write('\n');
        suggestions.forEach((suggestion, index) => {
          if (index === selectedIndex) {
            // Highlight selected suggestion
            process.stdout.write(chalk.cyan(`  ${suggestion}\n`));
          } else {
            process.stdout.write(chalk.gray(`  ${suggestion}\n`));
          }
        });
        
        // Move cursor back to input line
        const linesToGoUp = suggestions.length;
        process.stdout.write(ansiEscapes.cursorUp(linesToGoUp));
      }

      // Position cursor at end of input
      process.stdout.write(ansiEscapes.cursorTo(`${promptLabel}: `.length + input.length));
    }

    function cleanup() {
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      rl.close();
      
      // Clear suggestions if showing
      if (showingSuggestions) {
        process.stdout.write(ansiEscapes.cursorTo(0));
        process.stdout.write(ansiEscapes.eraseDown);
        process.stdout.write(chalk.white(`${promptLabel}: ${input}\n`));
      } else {
        process.stdout.write('\n');
      }
    }

    function finish() {
      cleanup();
      const trimmed = input.trim();
      if (!trimmed) {
        console.log(chalk.red('Please enter a message'));
        resolve(autocompleteInput(promptLabel, false));
      } else {
        resolve(trimmed);
      }
    }

    // Initial render
    render();

    process.stdin.on('keypress', (str, key) => {
      if (!key) return;

      // Handle Ctrl+C
      if (key.ctrl && key.name === 'c') {
        cleanup();
        console.log(chalk.gray('\n👋 Goodbye!\n'));
        process.exit(0);
      }

      // Handle Enter
      if (key.name === 'return') {
        // If suggestions are showing and one is selected, use it
        if (showingSuggestions && suggestions.length > 0) {
          input = suggestions[selectedIndex];
          showingSuggestions = false;
          suggestions = [];
        }
        finish();
        return;
      }

      // Handle Tab - complete to first suggestion
      if (key.name === 'tab') {
        if (showingSuggestions && suggestions.length > 0) {
          input = suggestions[selectedIndex];
          updateSuggestions();
          render();
        }
        return;
      }

      // Handle arrow keys for suggestion navigation
      if (showingSuggestions && suggestions.length > 0) {
        if (key.name === 'down') {
          selectedIndex = (selectedIndex + 1) % suggestions.length;
          render();
          return;
        }
        if (key.name === 'up') {
          selectedIndex = selectedIndex === 0 ? suggestions.length - 1 : selectedIndex - 1;
          render();
          return;
        }
      }

      // Handle backspace
      if (key.name === 'backspace') {
        if (input.length > 0) {
          input = input.slice(0, -1);
          updateSuggestions();
          render();
        }
        return;
      }

      // Handle regular character input
      if (str && !key.ctrl && !key.meta && str.length === 1) {
        input += str;
        updateSuggestions();
        render();
      }
    });
  });
}

