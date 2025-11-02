# Context-Engine

Context-Engine is an interactive AI-powered CLI tool that enables developers to chat with their codebase using advanced language models like xAI's Grok. It provides instant access to project files, intelligent code analysis, and automated documentation generation through specialized sub-agents.

## Description

Context-Engine transforms your codebase into a conversational interface, allowing you to ask natural language questions about your code, architecture, and implementation details. The tool automatically loads relevant files, maintains conversation context, and supports multiple AI providers.

Key features include:
- **Intelligent File Loading**: Automatically identifies and loads relevant code files based on your questions
- **Sub-Agent System**: Specialized AI agents for tasks like generating README files and AGENTS.md documentation
- **Multi-Model Support**: Compatible with xAI Grok and other OpenAI-compatible models
- **Interactive Chat Interface**: Real-time conversation with token counting and streaming responses
- **Concurrent Task Execution**: Handle multiple sub-agent tasks simultaneously for efficient workflows

Use cases include code reviews, architecture explanations, debugging assistance, documentation generation, and onboarding new developers to complex projects.

## Installation

### Prerequisites
- Node.js ≥ 16.0.0
- xAI API key (obtain from [x.ai](https://x.ai))

### Installation Steps

1. **Install globally via npm:**
   ```bash
   npm install -g @lukaloehr/context-engine
   ```

2. **Set up your API key:**
   Create a `.env` file in your project root:
   ```bash
   XAI_API_KEY="xai-your_api_key_here"
   ```

3. **Verify installation:**
   ```bash
   context --version
   ```

### Post-Installation
The tool will automatically run a post-install script to verify dependencies and show initial setup instructions.

## Usage

### Basic Usage
Navigate to your project directory and start the interactive session:

```bash
cd your-project
context
```

The tool will:
1. Analyze your project structure
2. Load relevant files into context
3. Start an interactive chat session

### Interactive Commands
Within the chat interface, use these commands:

- **Ask about code**: "Explain the authentication flow" or "What does the user service do?"
- **Switch models**: Type "change model" to select different AI providers
- **Manage API keys**: Type "manage API keys" to import from .env
- **Clear conversation**: Type "clear chat" to reset while preserving context
- **Exit**: Type "exit" or Ctrl+C to close

### CLI Options
```bash
context --help
context --version
context --clear-config  # Reset configuration
```

### Sub-Agent Commands
Ask the AI to generate documentation:
- "Create a README file for this project"
- "Generate an AGENTS.md file explaining our AI agents"
- "Write documentation for the current codebase"

The AI will automatically invoke the appropriate sub-agent to create files.

## Features

- **Codebase Context Awareness**: Full project file access with intelligent loading
- **Streaming Responses**: Real-time AI responses with token counting
- **Multi-Tool Integration**: Supports file reading, configuration management, and sub-agent execution
- **Concurrent Sub-Agent Execution**: Run multiple documentation agents simultaneously
- **Model Flexibility**: Switch between xAI Grok, OpenAI models, and other compatible providers
- **Session Management**: Maintain conversation history while preserving performance
- **Error Handling**: Robust API error recovery and user-friendly messaging
- **Update Notifications**: Automatic version checking and upgrade notifications

### Sub-Agent Capabilities
- **README Generator**: Creates comprehensive project documentation
- **AGENTS Documentation**: Generates specialized AI agent documentation
- **Extensible Architecture**: Easy to add new specialized agents

## Contributing

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/luka-loehr/context-engine.git
   cd context-engine
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up development environment:**
   ```bash
   # Copy example environment
   cp .env.example .env
   
   # Set your API key
   echo 'XAI_API_KEY="your_key_here"' >> .env
   ```

4. **Run in development mode:**
   ```bash
   # Link globally for testing
   npm link
   
   # Test in a sample project
   cd ../your-test-project
   context
   ```

### Coding Standards
- Use ES modules (import/export syntax)
- Follow [JavaScript Standard Style](https://standardjs.com/)
- Write modular, single-responsibility functions
- Include comprehensive JSDoc comments
- Add unit tests for new features

### Adding New Sub-Agents
1. Create a new file in `src/sub-agents/agents/`
2. Implement the `SubAgent` base class interface
3. Register in `src/sub-agents/index.js`
4. Add tool definition to the registry
5. Test with sample projects

### Contribution Process
1. Fork the repository and create a feature branch
2. Make your changes and add tests
3. Ensure all tests pass: `npm test`
4. Submit a pull request with clear description
5. Follow up on review feedback

### Testing
Currently uses basic test setup. Contributions to expand test coverage are welcome:
- Unit tests for core utilities
- Integration tests for sub-agents
- E2E tests for CLI interactions

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*
