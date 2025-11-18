/**
 * Test script to verify concurrent terminal execution
 */

import { terminalManager } from './src/tools/terminal-manager.js';

async function testConcurrentExecution() {
    console.log('Testing concurrent terminal command execution...\n');

    // Simulate the AI calling multiple terminal commands at once
    const commands = [
        'echo "Command 1"',
        'echo "Command 2"',
        'echo "Command 3"',
        'sleep 0.1 && echo "Command 4"',
        'echo "Command 5"'
    ];

    console.log(`Executing ${commands.length} commands concurrently...\n`);

    const startTime = Date.now();

    // Execute all commands concurrently (simulating how the AI calls them)
    const results = await Promise.all(
        commands.map(cmd => terminalManager.execute(cmd))
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`\nExecution completed in ${duration}ms\n`);
    console.log('Results:');
    results.forEach((result, i) => {
        console.log(`  ${i + 1}. ${result.success ? '✓' : '✖'} ${result.command}`);
        if (result.output) {
            console.log(`     Output: ${result.output}`);
        }
    });

    console.log('\n--- Test Complete ---');
    console.log(`All commands executed: ${results.every(r => r.success) ? '✓ PASS' : '✖ FAIL'}`);
    console.log(`Concurrent execution: ${duration < 500 ? '✓ PASS' : '✖ FAIL'} (${duration}ms)`);
}

// Run the test
testConcurrentExecution().catch(console.error);
