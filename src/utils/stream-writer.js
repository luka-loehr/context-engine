import wrapAnsi from 'wrap-ansi';
import chalk from 'chalk';

/**
 * Helper function for streaming with word wrap and inline markdown
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
        const formatted = formatInline(lines[i]);
        const wrappedLine = wrapAnsi(formatted, maxWidth, { 
          hard: true, 
          wordWrap: true,
          trim: false
        });
        console.log(wrappedLine);
      }
      
      // Keep the last incomplete line in buffer
      buffer = lines[lines.length - 1];
      
      // If buffer is getting too long, wrap and flush it
      if (buffer.length > maxWidth) {
        const formatted = formatInline(buffer);
        const wrappedBuffer = wrapAnsi(formatted, maxWidth, { 
          hard: true, 
          wordWrap: true,
          trim: false
        });
        const wrappedLines = wrappedBuffer.split('\n');
        
        for (let i = 0; i < wrappedLines.length - 1; i++) {
          console.log(wrappedLines[i]);
        }
        
        buffer = wrappedLines[wrappedLines.length - 1];
      }
    },
    
    flush() {
      if (buffer) {
        const formatted = formatInline(buffer);
        const wrappedBuffer = wrapAnsi(formatted, maxWidth, { 
          hard: true, 
          wordWrap: true,
          trim: false
        });
        console.log(wrappedBuffer);
        buffer = '';
      }
    }
  };
}

/**
 * Format inline markdown (bold, italic, inline code)
 */
function formatInline(text) {
  let result = text;
  
  // **bold** → bold white text (distinct from cyan header)
  result = result.replace(/\*\*([^*]+)\*\*/g, (_, content) => chalk.white.bold(content));
  
  // *italic* → italic text  
  result = result.replace(/\*([^*]+)\*/g, (_, content) => chalk.italic(content));
  
  // `code` → yellow inline code (changed from cyan to avoid confusion with header)
  result = result.replace(/`([^`]+)`/g, (_, content) => chalk.yellow(content));
  
  return result;
}


