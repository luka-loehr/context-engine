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

Start by exploring key files like package.json, README.md, and main source files to understand the project structure, dependencies, and development workflow. Then create a comprehensive AGENTS.md file following this structure.

Use standard markdown formatting:
- # for main headings
- ## for section headings
- **bold** for emphasis
- *italics* for variables or emphasis
- \`code\` for inline code
- \`\`\` for code blocks
- - for bullet points
- Standard links and formatting

Use the getFileContent tool to explore files, and createFile tool to write the final AGENTS.md when ready.`;
  }

  /**
   * Get the initial exploration prompt
   * @returns {string} Initial prompt
   */
  getInitialPrompt() {
    return `Please analyze this codebase and create an AGENTS.md file. Start by examining the package.json, README.md, and key source files to understand the project structure, dependencies, and development workflow. Then create a comprehensive AGENTS.md file following the standard format.`;
  }
}
