import ansiEscapes from 'ansi-escapes';

/**
 * Clear a specific number of lines from the terminal
 */
export function clearLines(count) {
  process.stdout.write(ansiEscapes.eraseLines(count));
}

/**
 * Clear the entire screen
 */
export function clearScreen() {
  process.stdout.write(ansiEscapes.clearScreen);
}

/**
 * Move cursor up by n lines
 */
export function cursorUp(count) {
  process.stdout.write(ansiEscapes.cursorUp(count));
}

/**
 * Clear from cursor to end of screen
 */
export function clearFromCursor() {
  process.stdout.write(ansiEscapes.clearTerminal);
}

