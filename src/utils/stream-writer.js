/**
 * Context Engine - Stream Writer
 * Simple streaming text output with syntax highlighting
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import hljs from 'highlight.js';

/**
 * Detect programming language from code content
 */
function detectLanguage(code) {
  const patterns = {
    javascript: /function\s+|const\s+|let\s+|import\s+|export\s+/,
    python: /def\s+|class\s+|import\s+|from\s+|if\s+__name__\s*==/,
    java: /public\s+class\s+|import\s+java\.|public\s+static\s+void/,
    rust: /fn\s+|let\s+|use\s+|impl\s+|struct\s+/,
    cpp: /#include\s+|int\s+main\s*\(|std::/,
    go: /package\s+|func\s+|import\s+\(|type\s+/,
    php: /<\?php|\$[a-zA-Z_]/,
    sql: /\bSELECT\b|\bFROM\b|\bWHERE\b|\bINSERT\b|\bUPDATE\b/i,
    bash: /#!\/.*bash|echo\s+|#!\/.*sh/,
    html: /<html|<head|<body|<!DOCTYPE/,
    css: /\{[^}]*\}|\.[a-zA-Z-]+\s*\{|#[a-zA-Z-]+\s*\{/
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(code)) return lang;
  }
  return 'plaintext';
}

/**
 * Apply syntax highlighting to code
 */
function highlightCode(code, language) {
  try {
    return hljs.highlight(code, { language }).value;
  } catch {
    return code;
  }
}

/**
 * Process markdown code blocks
 */
function processCodeBlocks(text) {
  return text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
    if (!code.trim()) return match;
    const language = lang || detectLanguage(code);
    return `\`\`\`${lang || ''}\n${highlightCode(code, language)}\n\`\`\``;
  });
}

/**
 * Create a stream writer for AI response streaming
 */
export function createStreamWriter() {
  let buffer = '';

  return {
    /**
     * Write content chunk to buffer
     */
    write(chunk) {
      if (typeof chunk === 'string') {
        buffer += chunk;
      }
    },

    /**
     * Flush buffer with syntax highlighting
     */
    flush() {
      if (buffer) {
        const highlighted = processCodeBlocks(buffer);
        console.log(highlighted);
        buffer = '';
      }
    }
  };
}
