#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if this is a global installation
const isGlobal = process.env.npm_config_global === 'true' || 
                 process.env.npm_config_global === true ||
                 process.env.npm_lifecycle_event === 'postinstall' && 
                 !existsSync(resolve(__dirname, '../../package.json'));

if (!isGlobal) {
  console.log('\n⚠️  Warning: @lukaloehr/context-engine is a CLI tool and should be installed globally!\n');
  console.log('To install it globally, run:');
  console.log('\n  npm install -g @lukaloehr/context-engine\n');
  console.log('This will make the "context-engine" command available in your terminal.\n');
}