#!/usr/bin/env node

/**
 * context-engine CLI entry point
 * Interactive AI-powered codebase assistant using XAI Grok
 *
 * @author Luka Loehr
 * @license MIT
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { main } from '../src/index.js';

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
