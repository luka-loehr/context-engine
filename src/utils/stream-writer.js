import wrapAnsi from 'wrap-ansi';

/**
 * Helper function for streaming with word wrap
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
        const wrappedLine = wrapAnsi(lines[i], maxWidth, { hard: true, wordWrap: true });
        console.log(wrappedLine);
      }
      
      // Keep the last incomplete line in buffer
      buffer = lines[lines.length - 1];
      
      // If buffer is getting too long, wrap and flush it
      if (buffer.length > maxWidth) {
        const wrappedBuffer = wrapAnsi(buffer, maxWidth, { hard: true, wordWrap: true });
        const wrappedLines = wrappedBuffer.split('\n');
        
        for (let i = 0; i < wrappedLines.length - 1; i++) {
          console.log(wrappedLines[i]);
        }
        
        buffer = wrappedLines[wrappedLines.length - 1];
      }
    },
    
    flush() {
      if (buffer) {
        const wrappedBuffer = wrapAnsi(buffer, maxWidth, { hard: true, wordWrap: true });
        console.log(wrappedBuffer);
        buffer = '';
      }
    }
  };
}

