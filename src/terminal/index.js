/**
 * Context Engine - Terminal Utilities
 * Terminal and git integration utilities
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

export { getGitStatus } from './git.js';
export {
  clearPromptOutput,
  clearScreen,
  saveCursorPosition,
  restoreCursorPosition,
  moveCursorUp,
  moveCursorDown
} from './screen.js';
