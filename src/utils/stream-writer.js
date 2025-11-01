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
            const highlightedCode = highlightCodeBlock(codeBlockBuffer, codeBlockLang, maxWidth, options);
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
            const highlightedCode = highlightCodeBlock(codeBlockBuffer, codeBlockLang, maxWidth, options);
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
        const highlightedCode = highlightCodeBlock(codeBlockBuffer, codeBlockLang, maxWidth, options);
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
          const highlightedCode = highlightCodeBlock(codeBlockBuffer, codeBlockLang, maxWidth, options);
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
 * Highlight a code block with syntax colors using regex patterns
 */
function highlightCodeBlock(code, language, maxWidth, options) {
  const trimmedCode = code.trim();
  
  // Apply language-specific highlighting
  let highlighted;
  if (language === 'html' || language === 'xml') {
    highlighted = highlightHTML(trimmedCode);
  } else if (language === 'javascript' || language === 'js' || language === 'typescript' || language === 'ts') {
    highlighted = highlightJavaScript(trimmedCode);
  } else if (language === 'python' || language === 'py') {
    highlighted = highlightPython(trimmedCode);
  } else if (language === 'css' || language === 'scss') {
    highlighted = highlightCSS(trimmedCode);
  } else if (language === 'json') {
    highlighted = highlightJSON(trimmedCode);
  } else {
    // Generic highlighting for unknown languages
    highlighted = highlightGeneric(trimmedCode);
  }

  // Handle word wrapping for long lines
  const lines = highlighted.split('\n');
  const wrappedLines = lines.map(line => wrapText(line, maxWidth, options));
  return wrappedLines.join('\n');
}

/**
 * Highlight HTML/XML syntax
 */
function highlightHTML(code) {
  let result = code;
  
  // Step 1: Protect strings to prevent double-processing
  const stringPlaceholders = [];
  result = result.replace(/"([^"]*)"/g, (match, content) => {
    const placeholder = `__STRING_${stringPlaceholders.length}__`;
    stringPlaceholders.push(chalk.green(match));
    return placeholder;
  });
  
  // Step 2: Highlight comments
  result = result.replace(/<!--[\s\S]*?-->/g, (match) => chalk.gray(match));
  
  // Step 3: Highlight DOCTYPE
  result = result.replace(/<!DOCTYPE[^>]*>/gi, (match) => chalk.magenta(match));
  
  // Step 4: Highlight opening tags: <tagname
  result = result.replace(/<([a-zA-Z][a-zA-Z0-9]*)/g, (match, tag) => {
    return chalk.gray('<') + chalk.blue(tag);
  });
  
  // Step 5: Highlight closing tags: </tagname>
  result = result.replace(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g, (match, tag) => {
    return chalk.gray('</') + chalk.blue(tag) + chalk.gray('>');
  });
  
  // Step 6: Highlight self-closing tags and closing brackets
  result = result.replace(/\/>/g, chalk.gray('/>'));
  result = result.replace(/(?<!<\/)>/g, (match) => chalk.gray(match));
  
  // Step 7: Highlight attribute names (words followed by =)
  result = result.replace(/\s([a-zA-Z][a-zA-Z0-9\-]*)(?=__STRING_)/g, (match, attrName) => {
    return ' ' + chalk.cyan(attrName);
  });
  
  // Step 8: Highlight the = sign
  result = result.replace(/=(?=__STRING_)/g, chalk.gray('='));
  
  // Step 9: Restore strings (now colored)
  stringPlaceholders.forEach((coloredString, index) => {
    result = result.replace(`__STRING_${index}__`, coloredString);
  });
  
  return result;
}

/**
 * Highlight JavaScript/TypeScript syntax
 */
function highlightJavaScript(code) {
  let result = code;
  
  // Comments
  result = result.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, (match) => chalk.gray(match));
  
  // Strings
  result = result.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, (match) => chalk.green(match));
  
  // Numbers
  result = result.replace(/\b(\d+\.?\d*)\b/g, (match) => chalk.yellow(match));
  
  // Keywords
  const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'extends', 'import', 'export', 'default', 'async', 'await', 'try', 'catch', 'throw', 'new'];
  keywords.forEach(keyword => {
    result = result.replace(new RegExp(`\\b(${keyword})\\b`, 'g'), (match) => chalk.magenta(match));
  });
  
  return result;
}

/**
 * Highlight Python syntax
 */
function highlightPython(code) {
  let result = code;
  
  // Comments
  result = result.replace(/(#.*$)/gm, (match) => chalk.gray(match));
  
  // Strings
  result = result.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, (match) => chalk.green(match));
  
  // Numbers
  result = result.replace(/\b(\d+\.?\d*)\b/g, (match) => chalk.yellow(match));
  
  // Keywords
  const keywords = ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'lambda', 'yield', 'async', 'await'];
  keywords.forEach(keyword => {
    result = result.replace(new RegExp(`\\b(${keyword})\\b`, 'g'), (match) => chalk.magenta(match));
  });
  
  return result;
}

/**
 * Highlight CSS syntax
 */
function highlightCSS(code) {
  let result = code;
  
  // Comments
  result = result.replace(/(\/\*[\s\S]*?\*\/)/g, (match) => chalk.gray(match));
  
  // Selectors
  result = result.replace(/^([^{]+)(?={)/gm, (match) => chalk.yellow(match));
  
  // Properties
  result = result.replace(/([a-zA-Z-]+)(?=\s*:)/g, (match) => chalk.cyan(match));
  
  // Values (strings and colors)
  result = result.replace(/:\s*([^;{]+)/g, (match, value) => ': ' + chalk.green(value));
  
  return result;
}

/**
 * Highlight JSON syntax
 */
function highlightJSON(code) {
  let result = code;
  
  // Strings (keys and values)
  result = result.replace(/"([^"]+)"(\s*:)/g, (match, key) => chalk.cyan('"' + key + '"') + chalk.gray(':'));
  result = result.replace(/:\s*"([^"]+)"/g, (match, value) => ': ' + chalk.green('"' + value + '"'));
  
  // Numbers
  result = result.replace(/:\s*(\d+\.?\d*)/g, (match, num) => ': ' + chalk.yellow(num));
  
  // Booleans and null
  result = result.replace(/:\s*(true|false|null)/g, (match, value) => ': ' + chalk.magenta(value));
  
  return result;
}

/**
 * Generic syntax highlighting for unknown languages
 */
function highlightGeneric(code) {
  let result = code;
  
  // Strings
  result = result.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, (match) => chalk.green(match));
  
  // Numbers
  result = result.replace(/\b(\d+\.?\d*)\b/g, (match) => chalk.yellow(match));
  
  // Comments (// and /* */ style)
  result = result.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm, (match) => chalk.gray(match));
  
  return result;
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


