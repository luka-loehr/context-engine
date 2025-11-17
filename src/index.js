/**
 * Context Engine - Main Entry Point
 * Uses modular architecture for better maintainability
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import { startApp } from './core/index.js';

/**
 * Main CLI application entry point
 */
export async function main() {
  await startApp();
}

