/**
 * SubAgent Manager
 * Handles concurrent execution of multiple sub-agents with coordinated UI
 */

import ora from 'ora';
import chalk from 'chalk';
import logUpdate from 'log-update';

export class SubAgentManager {
  constructor() {
    this.activeSubAgents = [];
    this.headerSpinner = null;
    this.results = [];
  }

  /**
   * Execute multiple sub-agents concurrently
   * @param {Array} subAgentConfigs - Array of {subAgent, params, projectContext, modelInfo, apiKey, provider}
   * @returns {Promise<Array>} Array of results from each sub-agent
   */
  async executeMultiple(subAgentConfigs) {
    if (subAgentConfigs.length === 0) {
      return [];
    }

    // Single subagent - use simple execution
    if (subAgentConfigs.length === 1) {
      const config = subAgentConfigs[0];
      const result = await config.subAgent.execute(
        config.params,
        config.projectContext,
        config.modelInfo,
        config.apiKey,
        config.provider
      );
      return [result];
    }

    // Multiple subagents - use concurrent execution with coordinated UI
    console.log(''); // Add spacing before subagent UI
    
    // Initialize tracking for each subagent
    this.activeSubAgents = subAgentConfigs.map((config, index) => ({
      name: config.subAgent.name,
      status: 'Initializing...',
      completed: false,
      index
    }));

    // Start header spinner
    this.startHeaderSpinner();

    // Start status update interval
    const updateInterval = setInterval(() => {
      this.renderStatus();
    }, 100);

    try {
      // Execute all subagents concurrently
      const promises = subAgentConfigs.map((config, index) => 
        this.executeWithTracking(config, index)
      );

      this.results = await Promise.all(promises);

      // Clear interval and render final status
      clearInterval(updateInterval);
      this.stopHeaderSpinner();
      
      // Show completion summary
      this.showCompletionSummary();

      return this.results;

    } catch (error) {
      clearInterval(updateInterval);
      this.stopHeaderSpinner();
      console.log(chalk.red(`\n✖ Error during concurrent execution: ${error.message}`));
      throw error;
    }
  }

  /**
   * Execute a single subagent with status tracking
   */
  async executeWithTracking(config, index) {
    const { subAgent, params, projectContext, modelInfo, apiKey, provider } = config;

    try {
      // Create a custom execute method that intercepts status updates
      const result = await this.executeWithStatusInterception(
        subAgent,
        params,
        projectContext,
        modelInfo,
        apiKey,
        provider,
        index
      );

      this.activeSubAgents[index].completed = true;
      this.activeSubAgents[index].status = '✓ Complete';
      
      return result;

    } catch (error) {
      this.activeSubAgents[index].completed = true;
      this.activeSubAgents[index].status = `✖ Failed: ${error.message}`;
      throw error;
    }
  }

  /**
   * Execute subagent with intercepted status updates
   */
  async executeWithStatusInterception(subAgent, params, projectContext, modelInfo, apiKey, provider, index) {
    const { createProvider } = await import('../../providers/index.js');
    
    // Create sub-agent provider
    const subAgentProvider = createProvider(modelInfo.provider, apiKey, modelInfo.model);

    // Get sub-agent configuration
    const systemPrompt = subAgent.getSystemPrompt();
    const tools = subAgent.getTools();
    const initialPrompt = subAgent.getInitialPrompt();

    // Sub-agent tool handler with status interception
    const handleSubAgentToolCall = async (toolName, parameters) => {
      if (toolName === 'getFileContent') {
        this.updateSubAgentStatus(index, `Reading ${parameters.filePath}`);
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
          this.updateSubAgentStatus(index, 'Writing file...');
          
          const fs = await import('fs');
          const path = await import('path');

          const filePath = path.join(process.cwd(), parameters.filePath);
          fs.writeFileSync(filePath, parameters.content, 'utf8');

          this.updateSubAgentStatus(index, '✓ File created');
          
          return {
            success: true,
            message: parameters.successMessage,
            filePath: parameters.filePath,
            successMessage: parameters.successMessage
          };
        } catch (error) {
          return {
            success: false,
            error: `Failed to create file: ${error.message}`
          };
        }
      }

      if (toolName === 'statusUpdate') {
        this.updateSubAgentStatus(index, parameters.status);
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

    return { success: true };
  }

  /**
   * Update status for a specific subagent
   */
  updateSubAgentStatus(index, status) {
    if (this.activeSubAgents[index]) {
      this.activeSubAgents[index].status = status;
    }
  }

  /**
   * Start the header spinner
   */
  startHeaderSpinner() {
    const count = this.activeSubAgents.length;
    this.headerSpinnerActive = true;
    this.spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.spinnerIndex = 0;
  }

  /**
   * Stop the header spinner
   */
  stopHeaderSpinner() {
    this.headerSpinnerActive = false;
    logUpdate.clear();
  }

  /**
   * Render the current status of all subagents
   */
  renderStatus() {
    if (!this.headerSpinnerActive) return;

    const count = this.activeSubAgents.length;
    const spinnerFrame = this.spinnerFrames[this.spinnerIndex];
    this.spinnerIndex = (this.spinnerIndex + 1) % this.spinnerFrames.length;

    let output = chalk.cyan(`${spinnerFrame} ${count} Subagent${count > 1 ? 's' : ''} working...\n\n`);

    this.activeSubAgents.forEach(agent => {
      const statusColor = agent.completed 
        ? (agent.status.startsWith('✖') ? chalk.red : chalk.green)
        : chalk.yellow;
      
      output += `  ${chalk.bold(agent.name)}: ${statusColor(agent.status)}\n`;
    });

    logUpdate(output);
  }

  /**
   * Show completion summary after all subagents finish
   */
  showCompletionSummary() {
    logUpdate.clear();
    console.log(chalk.green('✓ All subagents completed successfully\n'));
    
    // Show individual completion messages
    this.activeSubAgents.forEach(agent => {
      console.log(chalk.green(`✔ ${agent.name} created successfully`));
    });
    
    console.log(''); // Add spacing after completion
  }
}

