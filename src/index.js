/**
 * Main entry point for context-engine
 * Uses modular architecture for better maintainability
 */

import { startApp } from './core/index.js';

/**
 * Main CLI application entry point
 */
export async function main() {
  await startApp();
}

