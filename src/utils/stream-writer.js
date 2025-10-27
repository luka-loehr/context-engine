import wrapAnsi from 'wrap-ansi';
import chalk from 'chalk';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

// Configure marked to use terminal renderer
marked.setOptions({
  renderer: new TerminalRenderer({
    code: chalk.cyan,
    blockquote: chalk.gray.italic,
    html: chalk.gray,
    heading: chalk.green.bold,
    firstHeading: chalk.magenta.bold,
    hr: chalk.reset,
    listitem: chalk.reset,
    list: chalk.reset,
    table: chalk.reset,
    paragraph: chalk.reset,
    strong: chalk.bold,
    em: chalk.italic,
    codespan: chalk.cyan,
    del: chalk.dim.strikethrough,
    link: chalk.blue.underline,
    href: chalk.blue.underline
  })
});

/**
 * Helper function for streaming with word wrap and markdown rendering
 */
export function createStreamWriter() {
  const terminalWidth = process.stdout.columns || 80;
  const maxWidth = Math.min(terminalWidth - 4, 76); // Leave some margin
  let completeMarkdown = '';
  let isFirstWrite = true;
  
  return {
    write(text) {
      completeMarkdown += text;
      
      // Show streaming dots for visual feedback (optional)
      if (isFirstWrite) {
        isFirstWrite = false;
      }
      // Don't print during streaming to avoid messing up markdown blocks
    },
    
    flush() {
      if (completeMarkdown) {
        // Clear any streaming indicators
        process.stdout.write('\r\x1b[K');
        
        // Render the complete markdown at once for proper block handling
        try {
          const rendered = marked(completeMarkdown);
          // Remove extra trailing newlines and print
          const cleaned = rendered.replace(/\n\n+$/g, '\n');
          process.stdout.write(cleaned);
        } catch (err) {
          // Fallback to plain text if markdown rendering fails
          console.log(completeMarkdown);
        }
        completeMarkdown = '';
      }
    }
  };
}


