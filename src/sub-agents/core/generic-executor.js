/**
 * Generic Agent Executor
 * Executes agents based on their configuration
 * Handles both default mode and custom instruction mode
 */

import ora from 'ora';
import { createProvider } from '../../providers/index.js';
import { getAllTools } from '../../tools/library/index.js';

export class GenericAgentExecutor {
  /**
   * Execute an agent with optional custom instructions
   * @param {Object} agentConfig - Agent configuration
   * @param {Object} context - Execution context
   * @param {string} customInstructions - Optional custom instructions from user
   * @returns {Promise<Object>} Execution result
   */
  async execute(agentConfig, context, customInstructions = null) {
    const { projectContext, modelInfo, apiKey } = context;
    const loadingSpinner = ora(`${agentConfig.name} working...`).start();

    const generatedFiles = [];
    const analysis = {
      filesCreated: [],
      filesRead: [],
      summary: '',
      keyFindings: []
    };

    try {
      // Create AI provider
      const provider = createProvider(modelInfo.provider, apiKey, modelInfo.model);

      // Build system prompt
      const systemPrompt = agentConfig.systemPrompt;

      // Build user prompt (default + custom if provided)
      let userPrompt = agentConfig.defaultInstructions;
      
      if (customInstructions) {
        userPrompt += `\n\n**Additional Instructions from User:**\n${customInstructions}\n\nPlease follow both the default instructions above AND these additional user instructions.`;
      }

      // Get tools for this agent
      const agentTools = this.getAgentTools(agentConfig);

      // Tool call handler
      const handleToolCall = async (toolName, parameters) => {
        // Track file operations
        if (toolName === 'getFileContent') {
          analysis.filesRead.push(parameters.filePath);
        }

        if (toolName === 'createFile') {
          if (parameters.filePath) {
            generatedFiles.push({
              path: parameters.filePath,
              content: parameters.content,
              successMessage: parameters.successMessage
            });
            analysis.filesCreated.push(parameters.filePath);
          }
        }

        // Execute the tool
        return await this.executeAgentTool(
          toolName,
          parameters,
          agentConfig,
          {
            projectContext,
            spinner: loadingSpinner,
            agentName: agentConfig.name,
            generatedFiles,
            allowedPaths: agentConfig.allowedPaths || [] // Path restrictions if any
          }
        );
      };

      // Execute agent
      await provider.refinePrompt(
        userPrompt,
        systemPrompt,
        null, // No streaming
        agentTools,
        handleToolCall
      );

      // Generate summary
      analysis.summary = this.generateSummary(agentConfig, analysis, generatedFiles);

      if (loadingSpinner.isSpinning) {
        loadingSpinner.succeed(`${agentConfig.name} completed`);
      }

      return {
        success: true,
        agentName: agentConfig.name,
        agentId: agentConfig.id,
        generatedFiles,
        analysis,
        totalFilesCreated: analysis.filesCreated.length,
        totalFilesRead: analysis.filesRead.length
      };
    } catch (error) {
      if (loadingSpinner.isSpinning) {
        loadingSpinner.fail(`${agentConfig.name} failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get tool definitions for an agent
   * @param {Object} agentConfig - Agent configuration
   * @returns {Array} Tool definitions in AI format
   */
  getAgentTools(agentConfig) {
    const allTools = getAllTools();
    const agentToolNames = agentConfig.tools;

    // Filter tools that the agent can use
    const agentTools = allTools.filter(tool => 
      agentToolNames.includes(tool.name)
    );

    // Convert to AI format
    return agentTools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }));
  }

  /**
   * Execute a tool for an agent
   * @param {string} toolName - Tool name
   * @param {Object} parameters - Tool parameters
   * @param {Object} agentConfig - Agent config
   * @param {Object} context - Execution context
   * @returns {Promise<any>} Tool result
   */
  async executeAgentTool(toolName, parameters, agentConfig, context) {
    // Check if agent has permission to use this tool
    if (!agentConfig.tools.includes(toolName)) {
      return {
        success: false,
        error: `Agent '${agentConfig.name}' does not have permission to use tool '${toolName}'`
      };
    }

    // Find and execute the tool
    const allTools = getAllTools();
    const tool = allTools.find(t => t.name === toolName);

    if (!tool) {
      return {
        success: false,
        error: `Tool '${toolName}' not found`
      };
    }

    try {
      return await tool.handler(parameters, context);
    } catch (error) {
      return {
        success: false,
        error: `Tool execution failed: ${error.message}`
      };
    }
  }

  /**
   * Generate summary of agent's work
   * @param {Object} agentConfig - Agent configuration
   * @param {Object} analysis - Analysis data
   * @param {Array} generatedFiles - Generated files
   * @returns {string} Summary
   */
  generateSummary(agentConfig, analysis, generatedFiles) {
    let summary = `${agentConfig.name} completed successfully. `;

    if (analysis.filesCreated.length > 0) {
      summary += `Created ${analysis.filesCreated.length} file(s): ${analysis.filesCreated.join(', ')}. `;
    }

    if (analysis.filesRead.length > 0) {
      summary += `Analyzed ${analysis.filesRead.length} file(s) to understand the codebase. `;
    }

    if (generatedFiles.length > 0) {
      summary += `Generated comprehensive documentation suitable for the intended audience.`;
    }

    return summary;
  }
}

// Export singleton instance
export const genericAgentExecutor = new GenericAgentExecutor();

