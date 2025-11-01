# Context-Engine

Context-Engine is an interactive AI-powered CLI tool that enables developers to chat with their codebase using advanced AI models like XAI Grok. It provides instant answers to questions about code, automatically loads relevant files, and supports sub-agent workflows for complex tasks.

## Description

Context-Engine transforms your codebase into an interactive AI assistant. By analyzing your project files and integrating with powerful AI models, it allows you to ask natural language questions about your code and receive intelligent, context-aware responses.

**Key Features:**
- **Codebase Context Awareness**: Automatically analyzes and indexes your project files for instant access
- **Interactive Chat Interface**: Natural language conversation with your codebase
- **Multi-Model Support**: Compatible with XAI Grok and other AI providers
- **Smart File Loading**: Dynamically loads relevant files based on your questions
- **Sub-Agent System**: Advanced workflow automation through specialized AI agents
- **Tool Integration**: Built-in tools for file operations, model switching, and configuration management
- **Streaming Responses**: Real-time AI responses with token counting and progress indicators

**Use Cases:**
- Understanding complex codebases quickly
- Debugging and troubleshooting assistance
- Codebase documentation and explanation
- Architecture analysis and design review
- Onboarding new team members to projects

## Installation

### Prerequisites
- Node.js ≥ 16.0.0
- An XAI API key (obtain from [x.ai](https://x.ai))

### Installation Steps

1. **Install globally via npm:**
   ```bash
   npm install -g @lukaloehr/context-engine
   ```

2. **Set up your API key:**
   Create a `.env` file in your project directory:
   ```bash
   echo 'XAI_API_KEY=your_xai_api_key_here' > .env
   ```
   
   Or set it as an environment variable:
   ```bash
   export XAI_API_KEY=your_xai_api_key_here
   ```

3. **Verify installation:**
   ```bash
   context --version
   ```

## Usage

### Basic Usage

1. **Navigate to your project directory:**
   ```bash
   cd /path/to/your/project
   ```

2. **Start the interactive session:**
   ```bash
   context
   ```

3. **Begin chatting with your codebase:**
   The tool will automatically analyze your project and start an interactive session.

### Command Line Options

```bash
context [options]

Options:
  --version, -v    Show version number
  --help, -h       Show help
```

### Interactive Commands

Within the chat session, use these commands:

- **`/exit`** - Exit the chat session
- **`/help`** - Show available commands and tips
- **`/model`** - Switch AI models
- **`/api`** - Manage API keys
- **`/clear`** - Clear conversation history (preserves context)

### Example Interactions

```
> What does the main function do in this project?

context-engine: The main function in src/index.js serves as the entry point for the Context-Engine CLI application. It imports and calls the startApp function from the core module, which handles the complete application initialization including CLI setup, command registration, and starting the interactive session.

> Show me the authentication flow

[AI loads and displays relevant authentication files with explanations]
```

## Features

- **Project Context Analysis**: Automatically scans and indexes all project files for comprehensive context awareness
- **Multi-Provider Support**: Works with XAI Grok and extensible to other AI providers
- **Real-time Streaming**: Live response generation with progress indicators and token counting
- **Smart Tool Integration**: Dynamic tool calling for file operations, configuration, and workflow automation
- **Sub-Agent Architecture**: Specialized AI agents for complex tasks like file generation and analysis
- **Conversation Memory**: Maintains context across interactions while allowing history clearing
- **Error Handling**: Robust API error management with fallback mechanisms
- **Update Notifications**: Automatic version checking and upgrade notifications
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Contributing

We welcome contributions to improve Context-Engine! Please follow these guidelines:

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
   # Add your XAI API key to .env
   ```

4. **Run in development mode:**
   ```bash
   # Link for local development
   npm link
   
   # Test in a sample project directory
   cd /path/to/test/project
   context
   ```

### Coding Standards

- Use ES modules (import/export syntax)
- Follow [JavaScript Standard Style](https://standardjs.com/)
- Write descriptive commit messages
- Add tests for new features
- Update documentation for API changes

### Contribution Process

1. Fork the repository and create a feature branch
2. Make your changes and ensure tests pass
3. Submit a pull request with a clear description of changes
4. Ensure your code follows the project's style guidelines

### Testing

Currently, the project uses manual testing. Contributions adding comprehensive test suites are especially welcome.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*