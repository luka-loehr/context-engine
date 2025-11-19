/**
 * Context Engine - Status Update Tools
 * Tools for real-time task status updates
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import { taskManager } from '../../ui/task-manager.js';

export const statusUpdateTools = [
    {
        name: 'statusUpdate',
        category: 'status',
        description: 'Create or update a task with real-time status. Use this to show progress to the user during long operations like writing files, planning, or processing. CRITICAL: Always create a task BEFORE doing work, update it during work, and complete it after.',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['create', 'update', 'complete', 'fail'],
                    description: 'Action to perform: "create" a new task, "update" task status, "complete" when finished, or "fail" on error'
                },
                taskId: {
                    type: 'string',
                    description: 'Task ID (returned from create action, required for update/complete/fail)'
                },
                taskName: {
                    type: 'string',
                    description: 'Name of the task (required for create action, e.g., "Backend Setup", "Writing HTML File", "Database Migration")'
                },
                status: {
                    type: 'string',
                    description: 'Status message (for create/update actions, e.g., "Planning structure...", "Writing components...", "Adding styles...")'
                },
                message: {
                    type: 'string',
                    description: 'Final message (for complete/fail actions, e.g., "Created 5 files", "Error: File not found")'
                }
            },
            required: ['action']
        },
        handler: async (parameters, context) => {
            const { action, taskId, taskName, status, message } = parameters;

            switch (action) {
                case 'create':
                    if (!taskName) {
                        return {
                            success: false,
                            error: 'taskName is required for create action'
                        };
                    }

                    const newTaskId = taskManager.createTask(taskName, status || 'Pending');

                    return {
                        success: true,
                        taskId: newTaskId,
                        message: `Task "${taskName}" created with ID ${newTaskId}`
                    };

                case 'update':
                    if (!taskId || !status) {
                        return {
                            success: false,
                            error: 'taskId and status are required for update action'
                        };
                    }

                    taskManager.updateTask(taskId, status);

                    return {
                        success: true,
                        message: `Task ${taskId} updated`
                    };

                case 'complete':
                    if (!taskId) {
                        return {
                            success: false,
                            error: 'taskId is required for complete action'
                        };
                    }

                    taskManager.completeTask(taskId, message);

                    return {
                        success: true,
                        message: `Task ${taskId} completed`
                    };

                case 'fail':
                    if (!taskId) {
                        return {
                            success: false,
                            error: 'taskId is required for fail action'
                        };
                    }

                    taskManager.failTask(taskId, message || 'Failed');

                    return {
                        success: false,
                        error: message || 'Task failed',
                        message: `Task ${taskId} marked as failed`
                    };

                default:
                    return {
                        success: false,
                        error: `Unknown action: ${action}`
                    };
            }
        }
    }
];
