#!/usr/bin/env node

/**
 * Test the updated chat command to suppress "Loaded file (0)" messages
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing updated chat command to suppress file loading messages\n');

// Start the context-engine CLI
const cli = spawn('node', ['src/index.js'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let sawLoadedFileMessage = false;

cli.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  console.log(`[CLI OUTPUT]: ${text.trim()}`);
  
  if (text.includes('Loaded file')) {
    sawLoadedFileMessage = true;
  }
});

cli.stderr.on('data', (data) => {
  const text = data.toString();
  console.error(`[CLI ERROR]: ${text.trim()}`);
});

cli.on('close', (code) => {
  console.log(`\nCLI exited with code ${code}`);
  console.log('\n📊 Test Results:');
  console.log('─'.repeat(60));
  
  if (sawLoadedFileMessage) {
    console.log('⚠️  Still seeing "Loaded file" messages');
    console.log('The fix may need adjustment');
  } else {
    console.log('✅ SUCCESS: No "Loaded file" messages seen!');
    console.log('The output should be cleaner now');
  }
  
  console.log('─'.repeat(60));
});

// Send a test message after a short delay
setTimeout(() => {
  console.log('\n📤 Sending test message to CLI...');
  cli.stdin.write('tell me which branches exist\n');
  
  // Wait for response, then exit
  setTimeout(() => {
    console.log('\n⏰ Exiting CLI after timeout...');
    cli.stdin.write('exit\n');
  }, 8000);
}, 2000);