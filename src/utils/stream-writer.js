import wrapAnsi from 'wrap-ansi';
import chalk from 'chalk';
import { createHighlighter } from 'shiki';

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
export async function createStreamWriter() {
  const terminalWidth = process.stdout.columns || 80;
  const maxWidth = Math.min(terminalWidth - 4, 76); // Leave some margin
  const options = { hard: true, wordWrap: true, trim: false };

  // Initialize Shiki highlighter
  const highlighter = await createHighlighter({
    themes: ['dark-plus'],
    langs: [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust',
      'php', 'ruby', 'swift', 'kotlin', 'dart', 'scala', 'html', 'css', 'scss',
      'json', 'yaml', 'xml', 'sql', 'bash', 'shell', 'powershell', 'dockerfile',
      'markdown', 'latex', 'r', 'matlab', 'lua', 'perl', 'haskell', 'clojure',
      'scheme', 'erlang', 'elixir', 'vim', 'diff', 'log', 'plaintext'
    ]
  });

  let buffer = '';
  let isInCodeBlock = false; // State for multi-line code blocks
  let codeBlockBuffer = ''; // Buffer for complete code blocks
  let codeBlockLang = ''; // Language for current code block

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
            // Start of code block - extract language and suppress this line
            isInCodeBlock = true;
            codeBlockLang = line.trim().slice(3).toLowerCase() || 'plaintext'; // Extract language after ```
            codeBlockBuffer = '';
          } else {
            // End of code block - highlight and output the complete block
            isInCodeBlock = false;
            const highlightedCode = highlightCodeBlock(codeBlockBuffer, codeBlockLang, highlighter, maxWidth, options);
            console.log(highlightedCode);
            codeBlockBuffer = '';
            codeBlockLang = '';
          }
          continue; // Skip printing the delimiter line
        }

        // Handle content based on code block state
        if (isInCodeBlock) {
          // Inside code block - buffer for syntax highlighting
          codeBlockBuffer += line + '\n';
        } else {
          // Outside code block - apply normal formatting
          // Check for special prefixes
          if (line.trim().startsWith('[HEADLINE]')) {
            // Extract headline text and format as bold white
            const headlineText = line.replace(/\[HEADLINE\]\s*/i, '').trim();
            line = chalk.bold.white(headlineText);
          } else if (line.trim() === '---' || line.trim() === '___') {
            // Horizontal rule - render as gray line
            line = chalk.gray('─'.repeat(maxWidth));
          } else {
            // Outside code block - apply inline markdown formatting
            line = formatInline(line);
          }

          // Skip wrapping for horizontal rules
          if (!line.startsWith('\x1b[90m─')) {
            line = wrapText(line, maxWidth, options);
          }
          console.log(line);
        }
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
            codeBlockLang = line.trim().slice(3).toLowerCase() || 'plaintext';
            codeBlockBuffer = '';
          } else {
            isInCodeBlock = false;
            const highlightedCode = highlightCodeBlock(codeBlockBuffer, codeBlockLang, highlighter, maxWidth, options);
            console.log(highlightedCode);
            codeBlockBuffer = '';
            codeBlockLang = '';
          }
          buffer = ''; // Clear buffer and skip
          return;
        }

        // Handle content based on code block state
        if (isInCodeBlock) {
          // Inside code block - buffer for syntax highlighting
          codeBlockBuffer += line + '\n';
          buffer = '';
        } else {
          // Outside code block - apply normal formatting
          // Check for special prefixes
          if (line.trim().startsWith('[HEADLINE]')) {
            const headlineText = line.replace(/\[HEADLINE\]\s*/i, '').trim();
            line = chalk.bold.white(headlineText);
          } else if (line.trim() === '---' || line.trim() === '___') {
            line = chalk.gray('─'.repeat(maxWidth));
          } else {
            line = formatInline(line);
          }

          const wrappedBuffer = wrapText(line, maxWidth, options);
          const wrappedLines = wrappedBuffer.split('\n');

          for (let i = 0; i < wrappedLines.length - 1; i++) {
            console.log(wrappedLines[i]);
          }

          buffer = wrappedLines[wrappedLines.length - 1];
        }
      }
    },
    
    flush() {
      // Handle any remaining code block content first
      if (isInCodeBlock && codeBlockBuffer.trim()) {
        const highlightedCode = highlightCodeBlock(codeBlockBuffer, codeBlockLang, highlighter, maxWidth, options);
        console.log(highlightedCode);
        isInCodeBlock = false;
        codeBlockBuffer = '';
        codeBlockLang = '';
      }

      if (!buffer) {
        buffer = '';
        return;
      }

      let line = buffer;

      // Check for code block delimiter
      if (line.trim().startsWith('```')) {
        if (!isInCodeBlock) {
          isInCodeBlock = true;
          codeBlockLang = line.trim().slice(3).toLowerCase() || 'plaintext';
          codeBlockBuffer = '';
        } else {
          isInCodeBlock = false;
          const highlightedCode = highlightCodeBlock(codeBlockBuffer, codeBlockLang, highlighter, maxWidth, options);
          console.log(highlightedCode);
          codeBlockBuffer = '';
          codeBlockLang = '';
        }
        buffer = '';
        return; // Skip printing delimiter
      }

      // Handle content based on code block state
      if (isInCodeBlock) {
        // Inside code block - buffer for syntax highlighting
        codeBlockBuffer += line + '\n';
      } else {
        // Outside code block - apply normal formatting
        // Check for special prefixes
        if (line.trim().startsWith('[HEADLINE]')) {
          const headlineText = line.replace(/\[HEADLINE\]\s*/i, '').trim();
          line = chalk.bold.white(headlineText);
        } else if (line.trim() === '---' || line.trim() === '___') {
          line = chalk.gray('─'.repeat(maxWidth));
        } else {
          line = formatInline(line);
        }

        const wrappedBuffer = wrapText(line, maxWidth, options);
        console.log(wrappedBuffer);
      }
      buffer = '';
    }
  };
}

/**
 * Highlight a code block using Shiki
 */
function highlightCodeBlock(code, language, highlighter, maxWidth, options) {
  try {
    // Use Shiki to highlight the code with ANSI output
    const ansiCode = highlighter.codeToAnsi(code.trim(), {
      lang: language,
      theme: 'dark-plus'
    });

    // The ANSI output from Shiki already includes proper coloring
    // We just need to handle word wrapping for long lines
    const lines = ansiCode.split('\n');
    const wrappedLines = lines.map(line => wrapText(line, maxWidth, options));
    return wrappedLines.join('\n');
  } catch (error) {
    // Fallback to basic blue highlighting if syntax highlighting fails
    const lines = code.trim().split('\n');
    const wrappedLines = lines.map(line => {
      const wrapped = wrapText(line, maxWidth, options);
      return chalk.blue(wrapped);
    });
    return wrappedLines.join('\n');
  }
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


