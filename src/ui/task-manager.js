/**
 * Context Engine - Task Manager
 * Manages concurrent task execution with real-time status updates
 * 
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import chalk from 'chalk';
import readline from 'readline';

class TaskManager {
    constructor() {
        // Map of taskId -> task info
        this.tasks = new Map();
        this.nextTaskId = 1;
        this.isRendering = false;
        this.lastLineCount = 0;
        this.spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        this.frameIndex = 0;
        this.intervalId = null;
    }

    /**
     * Start the rendering loop if not already running
     */
    startRendering() {
        if (this.isRendering) return;
        this.isRendering = true;

        // Hide cursor
        process.stdout.write('\u001B[?25l');

        this.intervalId = setInterval(() => {
            this.frameIndex = (this.frameIndex + 1) % this.spinnerFrames.length;
            this.render();
        }, 80);
    }

    /**
     * Stop the rendering loop
     */
    stopRendering() {
        if (!this.isRendering) return;
        this.isRendering = false;
        if (this.intervalId) clearInterval(this.intervalId);

        // Final render to ensure completed states are shown
        this.render();

        // Show cursor
        process.stdout.write('\u001B[?25h');

        // Reset line count so next output doesn't overwrite
        this.lastLineCount = 0;
    }

    /**
     * Render the task dashboard
     */
    render() {
        const lines = [];

        // Header
        lines.push(chalk.bold('Tasks:'));

        // Tasks
        for (const task of this.tasks.values()) {
            let symbol;
            let statusColor = chalk.gray;

            if (task.failed) {
                symbol = chalk.red('✖');
                statusColor = chalk.red;
            } else if (task.completed) {
                symbol = chalk.green('✔');
                statusColor = chalk.green;
            } else {
                symbol = chalk.cyan(this.spinnerFrames[this.frameIndex]);
                statusColor = chalk.yellow;
            }

            // Format: Symbol TaskName: (Status)
            // Example: ⠋ Adding French Localisations: (Reading file...)
            lines.push(`${symbol} ${chalk.white(task.name)}: ${chalk.gray('(')}${statusColor(task.status)}${chalk.gray(')')}`);
        }

        const output = lines.join('\n');

        // Move cursor up to overwrite previous output
        if (this.lastLineCount > 0) {
            readline.moveCursor(process.stdout, 0, -this.lastLineCount);
        }

        // Clear screen down
        readline.clearScreenDown(process.stdout);

        // Write new output
        process.stdout.write(output + '\n');

        // Update last line count
        this.lastLineCount = lines.length;
    }

    /**
     * Create a new task
     * @param {string} name - Task name
     * @param {string} initialStatus - Initial status message
     * @returns {string} taskId
     */
    createTask(name, initialStatus = 'Starting...') {
        const taskId = `task_${this.nextTaskId++}`;

        this.tasks.set(taskId, {
            id: taskId,
            name,
            status: initialStatus,
            completed: false,
            failed: false,
            startTime: Date.now()
        });

        // Start rendering if this is the first task
        if (!this.isRendering) {
            this.startRendering();
        }

        return taskId;
    }

    /**
     * Update task status
     * @param {string} taskId - Task ID
     * @param {string} status - New status message
     */
    updateTask(taskId, status) {
        const task = this.tasks.get(taskId);
        if (!task) return;

        if (task.completed || task.failed) return;

        task.status = status;
        // Render will pick up the change on next tick
    }

    /**
     * Mark task as completed
     * @param {string} taskId - Task ID
     * @param {string} finalMessage - Optional final message
     */
    completeTask(taskId, finalMessage = null) {
        const task = this.tasks.get(taskId);
        if (!task) return;

        if (task.completed || task.failed) return;

        task.completed = true;
        task.status = finalMessage || 'Completed';

        // Check if all tasks are done
        if (this.allTasksCompleted()) {
            // We don't stop rendering immediately to show the "Completed" state for a moment
            // But the caller might want to stop it. 
            // For now, we keep rendering until explicit reset or new task?
            // Actually, we should probably stop the animation loop but keep the final state.
            // But let's keep it running for now so the user sees the checkmark.
        }
    }

    /**
     * Mark task as failed
     * @param {string} taskId - Task ID
     * @param {string} errorMessage - Error message
     */
    failTask(taskId, errorMessage) {
        const task = this.tasks.get(taskId);
        if (!task) return;

        if (task.completed || task.failed) return;

        task.failed = true;
        task.status = errorMessage;
    }

    /**
     * Get task by ID
     * @param {string} taskId
     * @returns {Object|null}
     */
    getTask(taskId) {
        return this.tasks.get(taskId) || null;
    }

    /**
     * Get all active (non-completed) tasks
     * @returns {Array}
     */
    getActiveTasks() {
        return Array.from(this.tasks.values()).filter(t => !t.completed && !t.failed);
    }

    /**
     * Check if all tasks are completed
     * @returns {boolean}
     */
    allTasksCompleted() {
        if (this.tasks.size === 0) return true;
        return Array.from(this.tasks.values()).every(t => t.completed || t.failed);
    }

    /**
     * Clear all completed tasks from tracking
     */
    clearCompletedTasks() {
        for (const [taskId, task] of this.tasks.entries()) {
            if (task.completed || task.failed) {
                this.tasks.delete(taskId);
            }
        }
    }

    /**
     * Reset all tasks (cleanup)
     */
    reset() {
        this.stopRendering();
        this.tasks.clear();
    }
}

// Export singleton instance
export const taskManager = new TaskManager();

// Export class for testing
export { TaskManager };
