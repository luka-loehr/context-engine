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
        this.spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        this.frameIndex = 0;
        this.intervalId = null;
    }

    /**
     * Check if there are any active tasks
     */
    hasActiveTasks() {
        return this.tasks.size > 0 && !this.allTasksCompleted();
    }

    /**
     * Start the rendering loop if not already running
     */
    startRendering() {
        if (this.isRendering) return;
        this.isRendering = true;

        // Save cursor position using ANSI escape code (more reliable than relative movements)
        process.stdout.write('\x1b7'); // ESC 7 - Save cursor position

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
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // Final render to ensure completed states are shown
        this.render();

        // Show cursor
        process.stdout.write('\u001B[?25h');
    }

    /**
     * Render the task dashboard
     */
    render() {
        const lines = [];

        // Header
        lines.push(chalk.bold('Tasks:'));

        // Check for timeouts (60 seconds without update)
        const now = Date.now();
        const TIMEOUT_MS = 60000; // 60 seconds

        // Tasks
        for (const task of this.tasks.values()) {
            // Auto-timeout check
            if (!task.completed && !task.failed && !task.timedOut) {
                if (now - task.lastUpdateTime > TIMEOUT_MS) {
                    task.timedOut = true;
                    task.status = 'Timed out after 60 seconds';
                }
            }

            let symbol;
            let statusColor = chalk.gray;

            if (task.timedOut) {
                symbol = chalk.yellow('⏱');
                statusColor = chalk.yellow;
            } else if (task.failed) {
                symbol = chalk.red('✖');
                statusColor = chalk.red;
            } else if (task.completed) {
                symbol = chalk.green('✔');
                statusColor = chalk.green;
            } else {
                symbol = chalk.cyan(this.spinnerFrames[this.frameIndex]);
                // Pending is red, other updates are orange (yellow)
                statusColor = task.status === 'Pending' ? chalk.red : chalk.yellow;
            }

            // Format: Symbol TaskName: (Status)
            // Example: ⠋ Adding French Localisations: (Reading file...)
            // Ensure single line
            const safeName = task.name.replace(/\n/g, ' ');
            const safeStatus = task.status.replace(/\n/g, ' ');
            lines.push(`${symbol} ${chalk.white(safeName)}: ${chalk.gray('(')}${statusColor(safeStatus)}${chalk.gray(')')}`);
        }

        const output = lines.join('\n');

        // Restore cursor to saved position (from startRendering)
        // This ensures we always start from the same position, regardless of scrolling or wrapping
        process.stdout.write('\x1b8'); // ESC 8 - Restore cursor position

        // Clear screen down from this position
        readline.clearScreenDown(process.stdout);

        // Write new output with extra spacing
        process.stdout.write(output + '\n\n');
    }

    /**
     * Create a new task
     * @param {string} name - Task name
     * @param {string} initialStatus - Initial status message
     * @returns {string} taskId
     */
    createTask(name, initialStatus = 'Pending') {
        const taskId = `task_${this.nextTaskId++}`;

        this.tasks.set(taskId, {
            id: taskId,
            name,
            status: initialStatus,
            completed: false,
            failed: false,
            timedOut: false,
            startTime: Date.now(),
            lastUpdateTime: Date.now()
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

        if (task.completed || task.failed || task.timedOut) return;

        task.status = status;
        task.lastUpdateTime = Date.now();
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

        // Check if all tasks are done - stop rendering after a brief delay
        if (this.allTasksCompleted()) {
            // Stop animation but keep final state visible
            setTimeout(() => {
                if (this.allTasksCompleted()) {
                    this.stopRendering();
                }
            }, 500);
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
        return Array.from(this.tasks.values()).filter(t => !t.completed && !t.failed && !t.timedOut);
    }

    /**
     * Check if all tasks are completed
     * @returns {boolean}
     */
    allTasksCompleted() {
        if (this.tasks.size === 0) return true;
        return Array.from(this.tasks.values()).every(t => t.completed || t.failed || t.timedOut);
    }

    /**
     * Clear all completed tasks from tracking
     */
    clearCompletedTasks() {
        for (const [taskId, task] of this.tasks.entries()) {
            if (task.completed || task.failed || task.timedOut) {
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
