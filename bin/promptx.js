#!/usr/bin/env node

/**
 * promptx CLI entry point
 * A CLI tool that transforms messy prompts into structured, clear prompts for AI agents
 * 
 * @author Luka Loehr
 * @license MIT
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { main } from '../src/index.js';

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
