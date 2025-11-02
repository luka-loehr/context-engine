/**
 * Base sub-agent system for context-engine
 * Provides a framework for creating specialized AI agents that can analyze codebases
 */

import { createProvider } from '../../providers/index.js';
import { getToolsForContext, getToolsForAgent, executeToolInContext } from '../../tools/index.js';
import ora from 'ora';

/**
 * Base SubAgent class
 * Provides common functionality for all sub-agents
 */
export class SubAgent {
  constructor(name, description, agentId = null) {
    this.name = name;
    this.description = description;
    this.agentId = agentId; // Optional: agent ID for agent-specific tools
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
    // Get tools from registry that are available to this specific agent
    // If agentId is set, get agent-specific tools + general subagent tools
    // Otherwise, get all subagent tools
    if (this.agentId) {
      return getToolsForAgent(this.agentId);
    }
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
   * @returns {Promise<Object>} Execution result with content and analysis
   */
  async execute(params, projectContext, modelInfo, apiKey, mainProvider) {
    const loadingSpinner = ora(`${this.description}...`).start();
    let isFirstStatusUpdate = true;
    const generatedFiles = [];
    const analysis = {
      filesCreated: [],
      filesRead: [],
      summary: '',
      keyFindings: []
    };

    try {
      // Create sub-agent provider
      const subAgentProvider = createProvider(modelInfo.provider, apiKey, modelInfo.model);

      // Get sub-agent configuration
      const systemPrompt = this.getSystemPrompt();
      const tools = this.getTools();
      const initialPrompt = this.getInitialPrompt();

      // Sub-agent tool handler - uses ToolRegistry and captures results
      const handleSubAgentToolCall = async (toolName, parameters) => {
        // Track file reading operations
        if (toolName === 'getFileContent') {
          analysis.filesRead.push(parameters.filePath);
        }

        // Track file creation operations and capture content
        if (toolName === 'createFile') {
          const result = await executeToolInContext(toolName, parameters, 'subagent', {
            projectContext,
            spinner: loadingSpinner,
            subAgentName: this.name,
            agentId: this.agentId,
            isFirstStatusUpdate,
            generatedFiles // Pass generated files for readGeneratedFile tool
          });

          if (result.success) {
            generatedFiles.push({
              path: parameters.filePath,
              content: parameters.content,
              successMessage: parameters.successMessage
            });
            analysis.filesCreated.push(parameters.filePath);
          }

          return result;
        }

        // Use the tool registry to execute other tools in subagent context
        return await executeToolInContext(toolName, parameters, 'subagent', {
          projectContext,
          spinner: loadingSpinner,
          subAgentName: this.name,
          agentId: this.agentId, // Pass agent ID for agent-specific tool access control
          isFirstStatusUpdate,
          generatedFiles // Pass generated files for readGeneratedFile tool
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

      // Generate summary of what was accomplished
      analysis.summary = this.generateSummary(analysis, generatedFiles);

      return {
        success: true,
        name: this.name,
        description: this.description,
        generatedFiles,
        analysis,
        totalFilesCreated: analysis.filesCreated.length,
        totalFilesRead: analysis.filesRead.length
      };

    } catch (error) {
      if (loadingSpinner.isSpinning) {
        loadingSpinner.fail(`${this.name} failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate a summary of the sub-agent's work
   * @param {Object} analysis - Analysis data
   * @param {Array} generatedFiles - Files that were created
   * @returns {string} Summary text
   */
  generateSummary(analysis, generatedFiles) {
    let summary = `${this.name} completed successfully. `;

    if (analysis.filesCreated.length > 0) {
      summary += `Created ${analysis.filesCreated.length} file(s): ${analysis.filesCreated.join(', ')}. `;
    }

    if (analysis.filesRead.length > 0) {
      summary += `Analyzed ${analysis.filesRead.length} file(s) to understand the codebase. `;
    }

    if (generatedFiles.length > 0) {
      const file = generatedFiles[0]; // Assuming single file creation for now
      summary += `The generated content provides a comprehensive overview suitable for developers and stakeholders.`;
    }

    return summary;
  }
}
