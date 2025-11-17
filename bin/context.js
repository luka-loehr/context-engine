#!/usr/bin/env node

/**
 * Context Engine - CLI Entry Point
 * Interactive AI-powered codebase assistant using XAI Grok
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { main } from '../src/index.js';

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
