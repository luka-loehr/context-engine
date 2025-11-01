/**
 * AGENTS.md Sub-Agent
 * Creates comprehensive AGENTS.md files for codebases
 */

import { SubAgent } from './base.js';

export class AgentsMdSubAgent extends SubAgent {
  constructor() {
    super('AGENTS.md', 'Creating AGENTS.md');
  }

  /**
   * Get the system prompt for AGENTS.md creation
   * @returns {string} System prompt
   */
  getSystemPrompt() {
    return `You are an expert AI assistant tasked with creating a comprehensive AGENTS.md file for this codebase.

AGENTS.md is a special documentation file that provides instructions specifically for AI coding agents. Use standard markdown formatting throughout.

IMPORTANT: Use the statusUpdate tool frequently to keep the user informed of your progress. Call statusUpdate every time you start a new major activity.

The file should contain these sections:

## Project Overview
Brief description of what this project does and its main purpose.

## Setup commands
Installation and development setup commands including:
- How to install dependencies
- How to start development servers
- How to run tests
- Any other important setup steps

## Code style
Coding conventions and formatting rules including:
- Language and module system used
- Naming conventions
- Import/export patterns
- Code organization principles
- Any linting or formatting tools

## Dev environment tips
Useful commands, workflows, and important gotchas including:
- Common development commands
- Build and deployment processes
- Environment setup requirements
- Troubleshooting tips
- Performance considerations

## Testing instructions
How to run tests and testing best practices including:
- Test commands
- Test structure and organization
- CI/CD setup
- Testing frameworks used
- Coverage requirements

## PR instructions
Guidelines for contributions and deployment including:
- Pull request process
- Code review requirements
- Versioning strategy
- Release process
- Documentation requirements

WORKFLOW:
1. Call statusUpdate with "scanning project files"
2. Use getFileContent to explore key files like package.json, README.md, and main source files
3. Call statusUpdate with "analyzing dependencies" after reading package.json
4. Call statusUpdate with "reviewing documentation" after reading README.md
5. Call statusUpdate with "examining code structure" when looking at source files
6. Call statusUpdate with "compiling project overview" when ready to summarize
7. Call statusUpdate with "finalizing AGENTS.md content" when structuring the document
8. Use createFile tool to write the final AGENTS.md when complete

Use the statusUpdate tool frequently - every time you start reading a new file type, analyzing a new aspect, or moving to a new phase of work. Keep status messages brief and clear.

Use standard markdown formatting:
- # for main headings
- ## for section headings
- **bold** for emphasis
- *italics* for variables or emphasis
- \`code\` for inline code
- \`\`\` for code blocks
- - for bullet points
- Standard links and formatting

Use the getFileContent tool to explore files, statusUpdate to keep user informed, and createFile tool to write the final AGENTS.md when ready.`;
  }

  /**
   * Get the initial exploration prompt
   * @returns {string} Initial prompt
   */
  getInitialPrompt() {
    return `Please analyze this codebase and create an AGENTS.md file. Start by calling statusUpdate with "scanning project files", then examine the package.json, README.md, and key source files to understand the project structure, dependencies, and development workflow. Use statusUpdate frequently to keep the user informed of your progress. Finally create a comprehensive AGENTS.md file following the standard format.`;
  }
}
