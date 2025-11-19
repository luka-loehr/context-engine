/**
 * Test script to demonstrate the new task-based UI system
 * 
 * This simulates how the agent would use the statusUpdate tool
 * to show real-time progress during long operations.
 */

import { taskManager } from './src/ui/task-manager.js';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateFileCreation() {
    console.log('\n=== Simulating: Creating a 1000-line HTML file ===\n');

    // 1. Create task
    const taskId = taskManager.createTask('Writing HTML File', 'Planning structure...');
    await sleep(2000);

    // 2. Update task as we work
    taskManager.updateTask(taskId, 'Writing header section...');
    await sleep(1500);

    taskManager.updateTask(taskId, 'Writing main content (200/1000 lines)...');
    await sleep(1500);

    taskManager.updateTask(taskId, 'Writing main content (500/1000 lines)...');
    await sleep(1500);

    taskManager.updateTask(taskId, 'Writing main content (800/1000 lines)...');
    await sleep(1500);

    taskManager.updateTask(taskId, 'Adding styles and scripts...');
    await sleep(1000);

    taskManager.updateTask(taskId, 'Finalizing and saving file...');
    await sleep(500);

    // 3. Complete task
    taskManager.completeTask(taskId, 'Created 1000-line HTML file');

    console.log('\n✓ Total time: ~9.5 seconds with constant visibility\n');
}

async function simulateConcurrentTasks() {
    console.log('\n=== Simulating: Concurrent tasks (Backend, Frontend, Database) ===\n');

    // Create multiple tasks
    const backendTask = taskManager.createTask('Backend Setup', 'Creating server files...');
    const frontendTask = taskManager.createTask('Frontend', 'Setting up components...');
    const dbTask = taskManager.createTask('Database', 'Planning schema...');

    // Simulate concurrent work
    await sleep(1000);
    taskManager.updateTask(backendTask, 'Writing API routes...');
    taskManager.updateTask(frontendTask, 'Creating UI components...');
    taskManager.updateTask(dbTask, 'Writing migrations...');

    await sleep(1500);
    taskManager.updateTask(frontendTask, 'Adding styles...');
    taskManager.completeTask(dbTask, 'Created 3 migration files');

    await sleep(1000);
    taskManager.updateTask(backendTask, 'Adding middleware...');
    taskManager.updateTask(frontendTask, 'Connecting to API...');

    await sleep(1500);
    taskManager.completeTask(backendTask, 'Created 8 backend files');

    await sleep(500);
    taskManager.completeTask(frontendTask, 'Created 12 frontend components');

    console.log('\n✓ All tasks completed independently!\n');
}

async function simulateFailure() {
    console.log('\n=== Simulating: Task with failure ===\n');

    const taskId = taskManager.createTask('Database Migration', 'Connecting to database...');
    await sleep(1000);

    taskManager.updateTask(taskId, 'Running migrations...');
    await sleep(1000);

    taskManager.failTask(taskId, 'Connection timeout');

    console.log('\n✓ Failure handled gracefully\n');
}

// Run demonstrations
async function runDemo() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║   Task-Based UI System Demo                       ║');
    console.log('║   Shows real-time progress for long operations    ║');
    console.log('╚════════════════════════════════════════════════════╝');

    await simulateFileCreation();
    await sleep(1000);

    await simulateConcurrentTasks();
    await sleep(1000);

    await simulateFailure();

    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║   Demo Complete!                                   ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
}

runDemo().catch(console.error);
