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
  let buffer = '';
  
  return {
    write(text) {
      buffer += text;
      const lines = buffer.split('\n');
      
      // Process all complete lines
      for (let i = 0; i < lines.length - 1; i++) {
        // Render markdown inline for the line
        const rendered = renderInlineMarkdown(lines[i]);
        const wrappedLine = wrapAnsi(rendered, maxWidth, { hard: true, wordWrap: true });
        console.log(wrappedLine);
      }
      
      // Keep the last incomplete line in buffer
      buffer = lines[lines.length - 1];
      
      // If buffer is getting too long, wrap and flush it
      if (buffer.length > maxWidth) {
        const rendered = renderInlineMarkdown(buffer);
        const wrappedBuffer = wrapAnsi(rendered, maxWidth, { hard: true, wordWrap: true });
        const wrappedLines = wrappedBuffer.split('\n');
        
        for (let i = 0; i < wrappedLines.length - 1; i++) {
          console.log(wrappedLines[i]);
        }
        
        buffer = wrappedLines[wrappedLines.length - 1];
      }
    },
    
    flush() {
      if (buffer) {
        const rendered = renderInlineMarkdown(buffer);
        const wrappedBuffer = wrapAnsi(rendered, maxWidth, { hard: true, wordWrap: true });
        console.log(wrappedBuffer);
        buffer = '';
      }
    }
  };
}

/**
 * Render inline markdown (bold, italic, code) for streaming
 */
function renderInlineMarkdown(text) {
  // Apply inline markdown formatting using chalk
  let result = text;
  
  // **bold** → bold text
  result = result.replace(/\*\*([^*]+)\*\*/g, (_, content) => chalk.bold(content));
  
  // *italic* → italic text
  result = result.replace(/\*([^*]+)\*/g, (_, content) => chalk.italic(content));
  
  // `code` → cyan code
  result = result.replace(/`([^`]+)`/g, (_, content) => chalk.cyan(content));
  
  // # Headings → green bold
  if (result.startsWith('#')) {
    result = result.replace(/^#+\s+(.+)$/, (_, content) => chalk.green.bold(content));
  }
  
  return result;
}

