# Context-Engine

Context-Engine is an interactive AI-powered CLI tool that enables developers to chat with their codebase using XAI Grok. It provides instant answers to questions about code structure, dependencies, and functionality by analyzing project files in real-time.

## Description

Context-Engine transforms your codebase into an interactive conversation partner. Using advanced AI models from XAI, it understands your project's architecture and can explain components, suggest improvements, and answer technical questions. Key features include:

- **Real-time file analysis**: Automatically loads and analyzes relevant files as you ask questions
- **Multi-model support**: Switch between different AI models for optimal performance
- **Interactive chat interface**: Natural language conversation with syntax highlighting and streaming responses
- **Tool integration**: Built-in tools for file access, configuration management, and documentation generation
- **Sub-agent system**: Specialized agents for creating README.md and AGENTS.md files
- **Session management**: Maintains conversation context while preserving project structure

Use cases include code reviews, onboarding new developers, debugging assistance, and automated documentation generation.

## Installation

### Prerequisites
- Node.js >= 16.0.0
- XAI API key (obtain from [x.ai](https://x.ai))

### Setup Steps

1. **Install globally via npm:**
   ```bash
   npm install -g @lukaloehr/context-engine
   ```

2. **Set your XAI API key:**
   Create a `.env` file in your project root:
   ```
   XAI_API_KEY=your_xai_api_key_here
   ```
   Or set as environment variable:
   ```bash
   export XAI_API_KEY=your_xai_api_key_here
   ```

3. **Verify installation:**
   ```bash
   context --version
   ```

The post-install script will automatically configure the tool and check for updates.

## Usage

### Basic Usage

Navigate to your project directory and start the interactive session:

```bash
cd your-project
context
```

This launches the AI assistant with full access to your codebase. Ask questions naturally:

- "What does the main function do?"
- "Explain the authentication flow"
- "How are database connections handled?"
- "Generate a README for this project"

### Command Line Options

```bash
context --help
```

Available commands:
- `context` - Start interactive chat session
- `context --model <name>` - Switch AI model
- `context --clear-config` - Reset configuration

### Interactive Commands

Within the chat session, use these commands:
- `/exit` - Close the session
- `/clear` - Clear conversation history (keep context)
- `/model` - Change AI model
- `/api` - Manage API keys
- `/help` - Show help information

### Example Session

```
> What is the main purpose of this project?

context-engine: This project is a React-based e-commerce platform built with TypeScript. The main entry point is `src/index.tsx` which sets up the routing with React Router and the global state management using Redux. The core features include user authentication, product catalog browsing, shopping cart functionality, and order processing.

The architecture follows a modular pattern with separate concerns for:
- Authentication (src/auth/)
- Products (src/products/)
- Cart (src/cart/)
- Orders (src/orders/)

Would you like me to explain any specific component in detail?
```

## Features

- **Intelligent File Loading**: Automatically identifies and loads relevant files based on your questions
- **Syntax Highlighting**: Code snippets are displayed with proper syntax coloring
- **Streaming Responses**: Real-time AI responses as they are generated
- **Token Management**: Tracks and displays token usage for cost awareness
- **Model Switching**: Support for multiple AI models with easy switching
- **Sub-Agent System**: Specialized agents for documentation generation (README.md, AGENTS.md)
- **Concurrent Processing**: Handles multiple file analysis requests efficiently
- **Error Recovery**: Graceful handling of API errors and missing files
- **Update Notifications**: Automatic checks for new versions
- **Cross-Platform**: Works on Windows, macOS, and Linux

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
   
   # Set your XAI API key in .env
   ```

4. **Run in development mode:**
   ```bash
   # Link globally for testing
   npm link
   
   # Test the CLI
   context --version
   ```

### Coding Standards

- Use ES modules (import/export syntax)
- Follow [JavaScript Standard Style](https://standardjs.com/)
- Write descriptive commit messages
- Add comprehensive JSDoc comments for public APIs
- Ensure cross-platform compatibility

### Contribution Process

1. Fork the repository and create a feature branch
2. Make your changes and add tests
3. Ensure code passes linting: `npm run lint`
4. Submit a pull request with detailed description
5. Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification

### Testing

Currently, the test suite is minimal. Contributions adding comprehensive tests are welcome:

```bash
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*