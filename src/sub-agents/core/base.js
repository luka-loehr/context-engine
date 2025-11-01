/**
 * Base sub-agent system for context-engine
 * Provides a framework for creating specialized AI agents that can analyze codebases
 */

import { createProvider } from '../../providers/index.js';
import { getToolsForContext, executeToolInContext } from '../../tools/index.js';
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
    // Get tools from registry that are available to subagents
    return getToolsForContext('subagent');
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

      // Sub-agent tool handler - uses ToolRegistry
      const handleSubAgentToolCall = async (toolName, parameters) => {
        // Use the tool registry to execute tools in subagent context
        return await executeToolInContext(toolName, parameters, 'subagent', {
          projectContext,
          spinner: loadingSpinner,
          subAgentName: this.name,
          isFirstStatusUpdate
        });
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
