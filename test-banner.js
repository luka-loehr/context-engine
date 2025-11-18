/**
 * Test script to verify welcome banner appearance
 */

import { showWelcomeBanner } from './src/session/banner.js';

// Mock project context
const mockContext = new Array(62).fill('file');
const mockPrefix = 'some content that is about 7.2k tokens long...'.repeat(100);

console.log('--- Testing Welcome Banner ---\n');

// Run the banner function
await showWelcomeBanner(mockContext, mockPrefix);

console.log('\n--- Test Complete ---');
