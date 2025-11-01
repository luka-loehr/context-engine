/**
 * Base sub-agent system for context-engine
 * Provides a framework for creating specialized AI agents that can analyze codebases
 */

import { createProvider } from '../providers/index.js';
import ora from 'ora';

/**
 * Base SubAgent class
 * Provides common functionality for all sub-agents
 */
export class SubAgent {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }

  /**
   * Get the system prompt for this sub-agent
   * @returns {string} System prompt
   */
  getSystemPrompt() {
    throw new Error('SubAgent subclasses must implement getSystemPrompt()');
  }

  /**
   * Get the available tools for this sub-agent
   * @returns {Array} Array of tool definitions
   */
  getTools() {
    return [
      {
        name: 'getFileContent',
        description: 'Get the full content of a specific file from the codebase. Use this to analyze code structure, dependencies, and configuration.',
        parameters: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'The exact path of the file to read (e.g., "package.json", "src/index.js")'
            }
          },
          required: ['filePath']
        }
      },
      {
        name: 'createFile',
        description: 'Create or overwrite a file with the specified content. Use this when you have completed your analysis and are ready to write the final output.',
        parameters: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'The path where to create the file (relative to project root)'
            },
            content: {
              type: 'string',
              description: 'The complete content to write to the file'
            },
            successMessage: {
              type: 'string',
              description: 'Optional custom success message to display when the file is created (e.g., "AGENTS.md for MyProject successfully created")'
            }
          },
          required: ['filePath', 'content']
        }
      },
      {
        name: 'statusUpdate',
        description: 'Provide a brief status update to the user about what you are currently doing. Use this frequently to keep the user informed of your progress. Keep messages very short and clear.',
        parameters: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'A very brief status message describing current activity (e.g., "analyzing dependencies", "reviewing README", "finalizing content")'
            }
          },
          required: ['status']
        }
      }
    ];
  }

  /**
   * Get the initial prompt for this sub-agent
   * @returns {string} Initial exploration prompt
   */
  getInitialPrompt() {
    throw new Error('SubAgent subclasses must implement getInitialPrompt()');
  }

  /**
   * Execute the sub-agent with the given parameters
   * @param {Object} params - Execution parameters
   * @param {Array} projectContext - Scanned project files
   * @param {Object} modelInfo - Current model information
   * @param {string} apiKey - API key for the provider
   * @param {Object} mainProvider - Main provider instance
   * @returns {Promise<Object>} Execution result
   */
  async execute(params, projectContext, modelInfo, apiKey, mainProvider) {
    const loadingSpinner = ora(`${this.description}...`).start();
    let isFirstStatusUpdate = true;

    try {
      // Create sub-agent provider
      const subAgentProvider = createProvider(modelInfo.provider, apiKey, modelInfo.model);

      // Get sub-agent configuration
      const systemPrompt = this.getSystemPrompt();
      const tools = this.getTools();
      const initialPrompt = this.getInitialPrompt();

      // Sub-agent tool handler
      const handleSubAgentToolCall = async (toolName, parameters) => {
        if (toolName === 'getFileContent') {
          // Find file in project context
          const file = projectContext.find(f => f.path === parameters.filePath);
          if (!file) {
            return {
              success: false,
              error: `File not found at path "${parameters.filePath}". Please check the file path and try again.`,
              filePath: parameters.filePath
            };
          }

          return {
            success: true,
            filePath: file.path,
            content: file.content
          };
        }

      if (toolName === 'createFile') {
        try {
          const fs = await import('fs');
          const path = await import('path');

          // Ensure we're writing to the project root
          const filePath = path.join(process.cwd(), parameters.filePath);

          // Write the file
          fs.writeFileSync(filePath, parameters.content, 'utf8');

          // Use custom success message if provided, otherwise use default
          const successMessage = parameters.successMessage ||
            `${this.name} completed successfully at ${parameters.filePath}`;

          loadingSpinner.succeed(successMessage);
          return {
            success: true,
            message: successMessage,
            filePath: parameters.filePath
          };
        } catch (error) {
          loadingSpinner.fail(`Failed to create ${this.name}: ${error.message}`);
          return {
            success: false,
            error: `Failed to create file: ${error.message}`
          };
        }
      }

      if (toolName === 'statusUpdate') {
        // Update the loading spinner with the status message
        if (loadingSpinner && loadingSpinner.isSpinning) {
          // Remove the prefix after the first status update
          if (isFirstStatusUpdate) {
            isFirstStatusUpdate = false;
          }
          loadingSpinner.text = parameters.status;
        } else {
          // If spinner is not running, just log the status
          console.log(`📝 ${this.name}: ${parameters.status}`);
        }
        return {
          success: true,
          message: `Status updated: ${parameters.status}`
        };
      }

      return {
        success: false,
        error: `Unknown tool: ${toolName}`
      };
    };

      // Run the sub-agent
      await subAgentProvider.refinePrompt(
        initialPrompt,
        systemPrompt,
        null, // No streaming for sub-agent
        tools,
        handleSubAgentToolCall
      );

      // If we get here without the spinner being updated, something went wrong
      if (loadingSpinner.isSpinning) {
        loadingSpinner.fail(`${this.name} failed - sub-agent did not complete successfully`);
      }

      return { success: true };

    } catch (error) {
      if (loadingSpinner.isSpinning) {
        loadingSpinner.fail(`${this.name} failed: ${error.message}`);
      }
      throw error;
    }
  }
}
