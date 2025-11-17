/**
 * Context Engine - Screen Management
 * Terminal screen and cursor control utilities
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

/**
 * Clear current line and move cursor up
 */
export function clearPromptOutput(lines = 1) {
  for (let i = 0; i < lines; i++) {
    process.stdout.write('\x1b[2K\r'); // Clear current line
    if (i < lines - 1) {
      process.stdout.write('\x1b[1A'); // Move up one line
    }
  }
}

/**
 * Clear the entire screen and move cursor to top
 */
export function clearScreen() {
  console.clear();
}

/**
 * Save cursor position
 */
export function saveCursorPosition() {
  process.stdout.write('\x1b[s');
}

/**
 * Restore cursor position
 */
export function restoreCursorPosition() {
  process.stdout.write('\x1b[u');
}

/**
 * Move cursor up by n lines
 */
export function moveCursorUp(lines = 1) {
  process.stdout.write(`\x1b[${lines}A`);
}

/**
 * Move cursor down by n lines
 */
export function moveCursorDown(lines = 1) {
  process.stdout.write(`\x1b[${lines}B`);
}
