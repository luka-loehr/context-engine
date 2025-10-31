import wrapAnsi from 'wrap-ansi';
import chalk from 'chalk';

/**
 * Wrap text with list indentation preservation
 */
function wrapText(text, maxWidth, options = { hard: true, wordWrap: true, trim: false }) {
  if (!text.trim()) return text;

  // Expanded regex to catch more bullet types: *, +, -, •, ─, —, numbered lists
  const listRegex = /^([*+\-•─—]|\d+[.)]\s*)\s+/;
  const match = text.match(listRegex);

  if (match) {
    const bullet = match[0];
    // Find the actual start of content after bullet and any extra spaces
    const contentStart = text.slice(0, match.index + bullet.length).length;
    const content = text.slice(contentStart);
    const indentWidth = contentStart; // Indent continuations by the full bullet width

    const contentWidth = maxWidth - indentWidth;

    if (contentWidth < 10) {
      return wrapAnsi(text, maxWidth, options);
    }

    const wrappedContent = wrapAnsi(content, contentWidth, options);
    const contentLines = wrappedContent.split('\n');

    let result = text.slice(0, contentStart) + contentLines[0];
    for (let j = 1; j < contentLines.length; j++) {
      // Indent each continuation line with spaces matching the bullet width
      // Preserve any leading spaces in the wrapped content line
      const indentedLine = ' '.repeat(indentWidth) + contentLines[j].trimStart();
      result += '\n' + indentedLine;
    }
    return result;
  } else {
    return wrapAnsi(text, maxWidth, options);
  }
}

/**
 * Helper function for streaming with word wrap and inline markdown
 */
export function createStreamWriter() {
  const terminalWidth = process.stdout.columns || 80;
  const maxWidth = Math.min(terminalWidth - 4, 76); // Leave some margin
  const options = { hard: true, wordWrap: true, trim: false };
  let buffer = '';
  let isInCodeBlock = false; // State for multi-line code blocks
  
  return {
    write(text) {
      buffer += text;
      const lines = buffer.split('\n');
      
      // Process all complete lines
      for (let i = 0; i < lines.length - 1; i++) {
        let line = lines[i];
        
        // Check for code block delimiters FIRST (before any formatting)
        if (line.trim().startsWith('```')) {
          if (!isInCodeBlock) {
            // Start of code block - suppress this line
            isInCodeBlock = true;
          } else {
            // End of code block - suppress this line
            isInCodeBlock = false;
          }
          continue; // Skip printing the delimiter line
        }
        
        // Apply formatting based on code block state
        if (isInCodeBlock) {
          // Inside code block - color blue, no inline formatting
          line = chalk.blue(line);
        } else {
          // Check for special prefixes
          if (line.trim().startsWith('[HEADLINE]')) {
            // Extract headline text and format as bold white
            const headlineText = line.replace(/\[HEADLINE\]\s*/i, '').trim();
            line = chalk.bold.white(headlineText);
          } else if (line.trim().startsWith('[NOTE]')) {
            // Extract note text and format as cyan
            const noteText = line.replace(/\[NOTE\]\s*/i, '').trim();
            line = chalk.cyan('ℹ ' + noteText);
          } else if (line.trim().startsWith('[WARNING]')) {
            // Extract warning text and format as yellow
            const warningText = line.replace(/\[WARNING\]\s*/i, '').trim();
            line = chalk.yellow('⚠ ' + warningText);
          } else if (line.trim().startsWith('[QUOTE]')) {
            // Extract quote text and format as magenta
            const quoteText = line.replace(/\[QUOTE\]\s*/i, '').trim();
            line = chalk.magenta('❝ ' + quoteText);
          } else if (line.trim() === '---' || line.trim() === '___') {
            // Horizontal rule - render as gray line
            line = chalk.gray('─'.repeat(maxWidth));
          } else {
            // Outside code block - apply inline markdown formatting
            line = formatInline(line);
          }
        }
        
        const wrappedLine = wrapText(line, maxWidth, options);
        console.log(wrappedLine);
      }
      
      // Keep the last incomplete line in buffer
      buffer = lines[lines.length - 1];
      
      // If buffer is getting too long, wrap and flush it
      if (buffer.length > maxWidth) {
        let line = buffer;
        
        // Check for code block delimiter
        if (line.trim().startsWith('```')) {
          if (!isInCodeBlock) {
            isInCodeBlock = true;
          } else {
            isInCodeBlock = false;
          }
          buffer = ''; // Clear buffer and skip
          return;
        }
        
        // Apply formatting based on code block state
        if (isInCodeBlock) {
          line = chalk.blue(line);
        } else {
          // Check for special prefixes
          if (line.trim().startsWith('[HEADLINE]')) {
            const headlineText = line.replace(/\[HEADLINE\]\s*/i, '').trim();
            line = chalk.bold.white(headlineText);
          } else if (line.trim().startsWith('[NOTE]')) {
            const noteText = line.replace(/\[NOTE\]\s*/i, '').trim();
            line = chalk.cyan('ℹ ' + noteText);
          } else if (line.trim().startsWith('[WARNING]')) {
            const warningText = line.replace(/\[WARNING\]\s*/i, '').trim();
            line = chalk.yellow('⚠ ' + warningText);
          } else if (line.trim().startsWith('[QUOTE]')) {
            const quoteText = line.replace(/\[QUOTE\]\s*/i, '').trim();
            line = chalk.magenta('❝ ' + quoteText);
          } else if (line.trim() === '---' || line.trim() === '___') {
            line = chalk.gray('─'.repeat(maxWidth));
          } else {
            line = formatInline(line);
          }
        }
        
        const wrappedBuffer = wrapText(line, maxWidth, options);
        const wrappedLines = wrappedBuffer.split('\n');
        
        for (let i = 0; i < wrappedLines.length - 1; i++) {
          console.log(wrappedLines[i]);
        }
        
        buffer = wrappedLines[wrappedLines.length - 1];
      }
    },
    
    flush() {
      if (!buffer) {
        buffer = '';
        return;
      }
      
      let line = buffer;
      
      // Check for code block delimiter
      if (line.trim().startsWith('```')) {
        if (!isInCodeBlock) {
          isInCodeBlock = true;
        } else {
          isInCodeBlock = false;
        }
        buffer = '';
        return; // Skip printing delimiter
      }
      
      // Apply formatting based on code block state
      if (isInCodeBlock) {
        line = chalk.blue(line);
      } else {
        // Check for special prefixes
        if (line.trim().startsWith('[HEADLINE]')) {
          const headlineText = line.replace(/\[HEADLINE\]\s*/i, '').trim();
          line = chalk.bold.white(headlineText);
        } else if (line.trim().startsWith('[NOTE]')) {
          const noteText = line.replace(/\[NOTE\]\s*/i, '').trim();
          line = chalk.cyan('ℹ ' + noteText);
        } else if (line.trim().startsWith('[WARNING]')) {
          const warningText = line.replace(/\[WARNING\]\s*/i, '').trim();
          line = chalk.yellow('⚠ ' + warningText);
        } else if (line.trim().startsWith('[QUOTE]')) {
          const quoteText = line.replace(/\[QUOTE\]\s*/i, '').trim();
          line = chalk.magenta('❝ ' + quoteText);
        } else if (line.trim() === '---' || line.trim() === '___') {
          line = chalk.gray('─'.repeat(maxWidth));
        } else {
          line = formatInline(line);
        }
      }
      
      const wrappedBuffer = wrapText(line, maxWidth, options);
      console.log(wrappedBuffer);
      buffer = '';
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
  
  // `code` → yellow inline code (commands, filenames, etc.)
  result = result.replace(/`([^`]+)`/g, (_, content) => chalk.yellow(content));

  // Auto-format em dashes (—) to add spaces if missing: word—word → word — word
  // But preserve if already spaced or at boundaries
  result = result.replace(/(?<!\s)—(?![\s\n]|$)/g, ' — ');
  result = result.replace(/—(?!\s)/g, ' —'); // Handle end of line if needed, but carefully
  
  return result;
}


