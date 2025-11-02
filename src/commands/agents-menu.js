/**
 * Agents Menu Command
 * Interactive menu for selecting and running specialized agents
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { autoAgentRegistry } from '../sub-agents/core/auto-registry.js';
import { genericAgentExecutor } from '../sub-agents/core/generic-executor.js';

/**
 * Show interactive agents menu and execute selected agent
 * @param {Object} context - Execution context
 * @returns {Promise<Object>} Execution result
 */
export async function showAgentsMenu(context) {
  const { projectContext, modelInfo, apiKey, session } = context;

  try {
    // Ensure agents are discovered
    if (autoAgentRegistry.agents.size === 0) {
      await autoAgentRegistry.discoverAgents();
    }

    const agents = autoAgentRegistry.getAllAgents();

    if (agents.length === 0) {
      console.log(chalk.yellow('\n⚠ No agents available. Please add agent files to src/sub-agents/agents/\n'));
      return { success: false, message: 'No agents available' };
    }

    // Build agent choices
    const agentChoices = agents.map(agent => ({
      name: `${agent.icon || '🤖'} ${agent.name} - ${agent.description}`,
      value: agent.id,
      short: agent.name
    }));

    // Add option to create new agent (if agent-creator exists)
    const hasAgentCreator = agents.some(a => a.id === 'agent-creator');
    if (hasAgentCreator) {
      agentChoices.push({
        name: `${chalk.green('➕ Create New Agent')}`,
        value: '__create__',
        short: 'Create Agent'
      });
    }

    // Show agent selection menu
    console.log(chalk.cyan.bold('\nSpecialized Agents\n'));

    const { selectedAgentId } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedAgentId',
      message: 'Select an agent:',
      choices: agentChoices,
      pageSize: 15
    }]);

    // Handle create new agent
    if (selectedAgentId === '__create__') {
      return await executeAgent('agent-creator', context, null);
    }

    // Get selected agent
    const agent = autoAgentRegistry.getAgent(selectedAgentId);
    if (!agent) {
      console.log(chalk.red('\n✖ Agent not found\n'));
      return { success: false, message: 'Agent not found' };
    }

    // Show agent details
    console.log(chalk.gray('\n────────────────────────────────────────'));
    console.log(chalk.bold(`\n${agent.icon} ${agent.name}`));
    console.log(chalk.gray(agent.description));
    console.log(chalk.gray(`\nCategory: ${agent.category || 'general'}`));
    console.log(chalk.gray(`Tools: ${agent.tools.join(', ')}`));
    console.log(chalk.gray('\n────────────────────────────────────────\n'));

    // Ask for custom instructions
    const { customInstructions } = await inquirer.prompt([{
      type: 'input',
      name: 'customInstructions',
      message: 'Enter custom instructions (press Enter to use defaults):',
      default: ''
    }]);

    // Execute the agent
    return await executeAgent(
      selectedAgentId,
      context,
      customInstructions.trim() || null
    );

  } catch (error) {
    if (error.isTtyError) {
      console.log(chalk.red('\n✖ Interactive menu not available in this environment\n'));
    } else {
      console.log(chalk.red(`\n✖ Error: ${error.message}\n`));
    }
    return { success: false, error: error.message };
  }
}

/**
 * Execute an agent by ID
 * @param {string} agentId - Agent ID
 * @param {Object} context - Execution context
 * @param {string|null} customInstructions - Optional custom instructions
 * @returns {Promise<Object>} Execution result
 */
export async function executeAgent(agentId, context, customInstructions = null) {
  const { projectContext, modelInfo, apiKey } = context;

  try {
    // Get agent config
    const agentConfig = autoAgentRegistry.getAgent(agentId);
    if (!agentConfig) {
      return {
        success: false,
        error: `Agent not found: ${agentId}`
      };
    }

    // Show execution message
    if (customInstructions) {
      console.log(chalk.cyan(`\n✨ Launching ${agentConfig.name} with custom instructions...\n`));
    } else {
      console.log(chalk.cyan(`\n✨ Launching ${agentConfig.name}...\n`));
    }

    // Execute agent
    const result = await genericAgentExecutor.execute(
      agentConfig,
      {
        projectContext,
        modelInfo,
        apiKey
      },
      customInstructions
    );

    // Format result for main AI
    let detailedMessage = `${agentConfig.name} completed successfully.\n\n`;

    // Add summary
    if (result.analysis && result.analysis.summary) {
      detailedMessage += `## Summary\n${result.analysis.summary}\n\n`;
    }

    // Add generated files info
    if (result.generatedFiles && result.generatedFiles.length > 0) {
      detailedMessage += `## Generated Files\n`;
      result.generatedFiles.forEach(file => {
        detailedMessage += `- **${file.path}**: ${file.successMessage || 'Created successfully'}\n`;
      });
      detailedMessage += `\n`;
    }

    // Add analysis details
    if (result.analysis) {
      detailedMessage += `## Analysis Details\n`;
      detailedMessage += `- Files analyzed: ${result.totalFilesRead || 0}\n`;
      detailedMessage += `- Files created: ${result.totalFilesCreated || 0}\n`;
    }

    // Add full content for AI reference
    if (result.generatedFiles && result.generatedFiles.length > 0) {
      detailedMessage += `\n## Full Content (For Your Reference - DO NOT Output to User)\n`;
      detailedMessage += `The following is the complete generated content. You can reference this to answer user questions, but DO NOT output it directly.\n\n`;
      result.generatedFiles.forEach(file => {
        detailedMessage += `### File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
      });
    }

    return {
      success: true,
      message: detailedMessage,
      agentResult: result,
      stopLoop: false // Let AI provide feedback
    };

  } catch (error) {
    console.log(chalk.red(`\n✖ Agent execution failed: ${error.message}\n`));
    return {
      success: false,
      error: error.message
    };
  }
}

