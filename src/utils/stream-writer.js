import wrapAnsi from 'wrap-ansi';
import chalk from 'chalk';
import hljs from 'highlight.js';

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
 * Highlight a code block using highlight.js with custom ANSI renderer
 */
function highlightCodeBlock(code, language, maxWidth, options) {
  const trimmedCode = code.trim();
  
  try {
    // Map common aliases
    const langMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'rb': 'ruby',
      'sh': 'bash',
      'yml': 'yaml',
      'md': 'markdown'
    };
    
    const mappedLang = langMap[language] || language;
    
    // Use highlight.js to parse the code
    let result;
    if (mappedLang && hljs.getLanguage(mappedLang)) {
      result = hljs.highlight(trimmedCode, { language: mappedLang });
    } else {
      result = hljs.highlightAuto(trimmedCode);
    }
    
    // Convert highlight.js HTML to ANSI colors
    const highlighted = convertHljsToAnsi(result.value);
    
    // Handle word wrapping for long lines
    const lines = highlighted.split('\n');
    const wrappedLines = lines.map(line => wrapText(line, maxWidth, options));
    return wrappedLines.join('\n');
  } catch (error) {
    // Fallback to basic coloring
    const lines = trimmedCode.split('\n');
    return lines.map(line => wrapText(chalk.dim(line), maxWidth, options)).join('\n');
  }
}

/**
 * Convert highlight.js HTML output to ANSI colors
 */
function convertHljsToAnsi(html) {
  let result = html;
  
  // Comprehensive color mapping for ALL highlight.js classes
  // Based on highlight.js documentation and common language grammars
  const colorMap = {
    // Keywords and control flow
    'hljs-keyword': chalk.magenta,
    'hljs-built_in': chalk.cyan,
    'hljs-type': chalk.cyan,
    'hljs-literal': chalk.blue,
    'hljs-params': chalk.white,
    
    // Functions and methods
    'hljs-function': chalk.yellow,
    'hljs-title': chalk.yellow,
    'hljs-title.function': chalk.yellow,
    'hljs-title.class': chalk.yellow,
    'hljs-title.function_': chalk.yellow,  // With underscore (new format)
    'hljs-title.class_': chalk.yellow,
    
    // Variables and identifiers
    'hljs-variable': chalk.white,
    'hljs-variable.language': chalk.cyan,
    'hljs-variable.constant': chalk.cyan,
    'hljs-property': chalk.cyan,
    'hljs-attr': chalk.cyan,
    'hljs-attribute': chalk.cyan,
    
    // Strings and characters
    'hljs-string': chalk.green,
    'hljs-char': chalk.green,
    'hljs-template-variable': chalk.green,
    'hljs-template-tag': chalk.green,
    'hljs-regexp': chalk.red,
    
    // Numbers
    'hljs-number': chalk.yellow,
    
    // Comments and documentation
    'hljs-comment': chalk.gray,
    'hljs-doctag': chalk.gray,
    'hljs-quote': chalk.gray,
    
    // HTML/XML/Markup
    'hljs-tag': chalk.blue,
    'hljs-name': chalk.blue,
    'hljs-selector-tag': chalk.blue,
    'hljs-selector-id': chalk.yellow,
    'hljs-selector-class': chalk.yellow,
    'hljs-selector-attr': chalk.cyan,
    'hljs-selector-pseudo': chalk.magenta,
    
    // Meta and preprocessor
    'hljs-meta': chalk.gray,
    'hljs-meta-keyword': chalk.magenta,
    'hljs-meta-string': chalk.green,
    'hljs-meta.prompt': chalk.gray,
    
    // Operators and punctuation
    'hljs-operator': chalk.white,
    'hljs-punctuation': chalk.gray,
    
    // Special
    'hljs-symbol': chalk.magenta,
    'hljs-bullet': chalk.cyan,
    'hljs-link': chalk.blue.underline,
    'hljs-emphasis': chalk.italic,
    'hljs-strong': chalk.bold,
    'hljs-formula': chalk.yellow,
    'hljs-section': chalk.yellow.bold,
    'hljs-code': chalk.green,
    
    // Diff
    'hljs-addition': chalk.green,
    'hljs-deletion': chalk.red,
    
    // Language-specific
    'hljs-subst': chalk.white,
    'hljs-decorator': chalk.magenta,
    'hljs-annotation': chalk.magenta,
    'hljs-built-in': chalk.cyan,
    'hljs-class': chalk.yellow,
    'hljs-module': chalk.cyan,
    'hljs-namespace': chalk.cyan,
    'hljs-package': chalk.cyan,
  };
  
  // Process spans with potentially multiple classes or complex class names
  // Handle both old format (hljs-title) and new format (hljs-title.function_)
  let iterations = 0;
  while (result.includes('<span') && iterations < 15) {
    result = result.replace(/<span class="([^"]+)">([^<]*?)<\/span>/g, (match, className, content) => {
      // Check for exact match first
      if (colorMap[className]) {
        return colorMap[className](content);
      }
      
      // Check for partial matches (in case of multiple classes)
      const classes = className.split(' ');
      for (const cls of classes) {
        if (colorMap[cls]) {
          return colorMap[cls](content);
        }
        // Also try with dots replaced by spaces for new format
        const altCls = cls.replace('.', ' ').split(' ')[0];
        if (colorMap[altCls]) {
          return colorMap[altCls](content);
        }
      }
      
      // No match found, return content as-is (white/default)
      return content;
    });
    iterations++;
  }
  
  // Remove any remaining HTML tags
  result = result.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  result = result.replace(/&lt;/g, '<');
  result = result.replace(/&gt;/g, '>');
  result = result.replace(/&amp;/g, '&');
  result = result.replace(/&quot;/g, '"');
  result = result.replace(/&#39;/g, "'");
  result = result.replace(/&#x27;/g, "'");
  
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


