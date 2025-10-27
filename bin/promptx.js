#!/usr/bin/env node

/**
 * promptx CLI entry point
 * A CLI tool that transforms messy prompts into structured, clear prompts for AI agents
 * 
 * @author Luka Loehr
 * @license MIT
 */

import { main } from '../src/index.js';

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
