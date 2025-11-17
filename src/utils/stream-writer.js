/**
 * Context Engine - Stream Writer
 * Handles streaming text output with syntax highlighting and formatting
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import wrapAnsi from 'wrap-ansi';
import chalk from 'chalk';
import hljs from 'highlight.js';

/**
 * Text formatting utilities
 */
class TextFormatter {
  constructor(maxWidth) {
    this.maxWidth = maxWidth;
    this.options = { hard: true, wordWrap: true, trim: false };
  }

  /**
   * Wrap text with list indentation preservation
   */
  wrapText(text) {
    if (!text.trim()) return text;

    const listRegex = /^([*+\-•─—]|\d+[.)]\s*)\s+/;
    const match = text.match(listRegex);

    if (match) {
      return this.wrapListItem(text, match);
    } else {
      return wrapAnsi(text, this.maxWidth, this.options);
    }
  }

  /**
   * Wrap a list item preserving indentation
   */
  wrapListItem(text, match) {
    const bullet = match[0];
    const contentStart = text.slice(0, match.index + bullet.length).length;
    const content = text.slice(contentStart);
    const indentWidth = contentStart;
    const contentWidth = this.maxWidth - indentWidth;

    if (contentWidth < 10) {
      return wrapAnsi(text, this.maxWidth, this.options);
    }

    const wrappedContent = wrapAnsi(content, contentWidth, this.options);
    const contentLines = wrappedContent.split('\n');

    let result = text.slice(0, contentStart) + contentLines[0];
    for (let j = 1; j < contentLines.length; j++) {
      const indentedLine = ' '.repeat(indentWidth) + contentLines[j].trimStart();
      result += '\n' + indentedLine;
    }
    return result;
  }
}

/**
 * Code highlighting utilities
 */
class CodeHighlighter {
  constructor(maxWidth) {
    this.maxWidth = maxWidth;
    this.options = { hard: true, wordWrap: true, trim: false };
  }

  /**
   * Highlight a code block
   */
  highlightCodeBlock(code, language) {
    if (!code.trim()) return '';

    try {
      const highlighted = hljs.highlight(code, { language }).value;
      const ansi = this.convertHljsToAnsi(highlighted);
      return this.wrapCodeBlock(ansi);
    } catch (error) {
      // Fallback to plain text if highlighting fails
      return this.wrapCodeBlock(code);
    }
  }

  /**
   * Wrap code block with proper formatting
   */
  wrapCodeBlock(code) {
    const lines = code.split('\n');
    const wrappedLines = lines.map(line => {
      if (line.length <= this.maxWidth - 4) {
        return line;
      }
      return wrapAnsi(line, this.maxWidth - 4, this.options);
    });
    return wrappedLines.join('\n');
  }

  /**
   * Convert highlight.js HTML to ANSI colors
   */
  convertHljsToAnsi(html) {
    const colorMap = {
      'hljs-keyword': chalk.blue,
      'hljs-string': chalk.green,
      'hljs-number': chalk.yellow,
      'hljs-comment': chalk.gray,
      'hljs-function': chalk.cyan,
      'hljs-variable': chalk.white,
      'hljs-type': chalk.magenta,
      'hljs-built_in': chalk.red,
      'hljs-literal': chalk.yellow
    };

    let result = html;
    for (const [className, colorFn] of Object.entries(colorMap)) {
      const regex = new RegExp(`<span class="${className}">([^<]*)</span>`, 'g');
      result = result.replace(regex, (match, content) => colorFn(content));
    }

    // Remove any remaining HTML tags
    result = result.replace(/<\/?span[^>]*>/g, '');
    return result;
  }
}

/**
 * Line processing utilities
 */
class LineProcessor {
  constructor(formatter, highlighter) {
    this.formatter = formatter;
    this.highlighter = highlighter;
  }

  /**
   * Process a line of text with special formatting
   */
  processLine(line) {
    // Handle code block delimiters
    if (line.trim().startsWith('```')) {
      return { type: 'codeDelimiter', content: line };
    }

    // Handle special prefixes
    if (line.trim().startsWith('[HEADLINE]')) {
      const headlineText = line.replace(/\[HEADLINE\]\s*/i, '').trim();
      return { type: 'headline', content: chalk.bold.white(headlineText) };
    }

    if (line.trim() === '---' || line.trim() === '___') {
      return { type: 'horizontalRule', content: chalk.gray('─'.repeat(Math.min(this.formatter.maxWidth, 76))) };
    }

    // Handle inline formatting
    const formattedLine = this.formatInline(line);

    // Apply text wrapping
    return { type: 'text', content: this.formatter.wrapText(formattedLine) };
  }

  /**
   * Format inline text with basic markdown-like syntax
   */
  formatInline(text) {
    let result = text;

    // Bold: **text** or __text__
    result = result.replace(/\*\*(.*?)\*\*/g, chalk.bold('$1'));
    result = result.replace(/__(.*?)__/g, chalk.bold('$1'));

    // Italic: *text* or _text_
    result = result.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, chalk.italic('$1'));
    result = result.replace(/(?<!_)_([^_]+)_(?!_)/g, chalk.italic('$1'));

    // Code: `text`
    result = result.replace(/`([^`]+)`/g, chalk.cyan('$1'));

    // Links: [text](url)
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, chalk.blue.underline('$1'));

    return result;
  }
}

/**
 * Create a stream writer for formatted text output
 */
export function createStreamWriter() {
  const terminalWidth = process.stdout.columns || 80;
  const maxWidth = Math.min(terminalWidth - 4, 76);

  // Create utility instances
  const formatter = new TextFormatter(maxWidth);
  const highlighter = new CodeHighlighter(maxWidth);
  const processor = new LineProcessor(formatter, highlighter);

  // Stream state
  let buffer = '';
  let isInCodeBlock = false;
  let codeBlockBuffer = '';
  let codeBlockLang = '';

  return {
    write(text) {
      buffer += text;
      const lines = buffer.split('\n');

      // Process all complete lines
      for (let i = 0; i < lines.length - 1; i++) {
        this.processLine(lines[i]);
      }

      // Keep the last incomplete line in buffer
      buffer = lines[lines.length - 1];
    },

    processLine(line) {
      // Check for code block delimiters first
      if (line.trim().startsWith('```')) {
        this.handleCodeDelimiter(line);
        return;
      }

      // Handle content based on code block state
      if (isInCodeBlock) {
        codeBlockBuffer += line + '\n';
      } else {
        const processed = processor.processLine(line);
        console.log(processed.content);
      }
    },

    handleCodeDelimiter(line) {
      if (!isInCodeBlock) {
        // Start of code block
        isInCodeBlock = true;
        codeBlockLang = line.trim().slice(3).toLowerCase() || 'plaintext';
        codeBlockBuffer = '';
      } else {
        // End of code block
        isInCodeBlock = false;
        const highlightedCode = highlighter.highlightCodeBlock(codeBlockBuffer, codeBlockLang);
        console.log(highlightedCode);
        codeBlockBuffer = '';
        codeBlockLang = '';
      }
    },

    flush() {
      // Process any remaining content in buffer
      if (buffer) {
        this.processLine(buffer);
        buffer = '';
      }

      // Close any open code blocks
      if (isInCodeBlock && codeBlockBuffer.trim()) {
        const highlightedCode = highlighter.highlightCodeBlock(codeBlockBuffer, codeBlockLang);
        console.log(highlightedCode);
        isInCodeBlock = false;
        codeBlockBuffer = '';
        codeBlockLang = '';
      }
    }
  };
}
