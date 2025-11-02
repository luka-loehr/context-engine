# Context Engine AGENTS.md

Context Engine is an interactive AI-powered CLI tool that enables developers to chat with their codebase using XAI Grok, providing instant answers and assistance directly from the code context.

## Project Overview

Context Engine is a command-line interface (CLI) application that integrates AI capabilities to help developers understand, navigate, and interact with their codebases. Built with Node.js and leveraging the XAI Grok API, it allows users to ask natural language questions about their projects and receive context-aware responses. The tool supports model configuration, project context refinement, and interactive chat sessions, making it an essential assistant for code exploration and debugging.

## Setup commands

### Installation
```bash
npm install -g @lukaloehr/context-engine
```

### Environment Setup
1. Create a `.env` file in your project root or home directory
2. Add your XAI API key: `XAI_API_KEY=your_api_key_here`
3. Ensure Node.js >= 16.0.0 is installed

### Starting the Application
```bash
# Launch the interactive CLI
context

# Or with specific options (handled via interactive prompts)
context --model grok-beta
```

### Post-Installation
The package automatically runs `postinstall` script to set up necessary configurations. Run `context` to complete initial setup including API key configuration and model selection.

## Code style

### Language and Module System
- **Language**: Modern JavaScript (ES2022+)
- **Module System**: ES Modules (`"type": "module"`)
- **Runtime**: Node.js >= 16.0.0

### Naming Conventions
- **Variables/Functions**: camelCase (e.g., `startApp`, `getProjectContext`)
- **Classes**: PascalCase (if used)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Files**: kebab-case for CLI scripts, descriptive names for modules

### Import/Export Patterns
- Use named exports for utilities and functions
- Dynamic imports for command handlers to avoid circular dependencies
- Relative imports within modules, absolute from entry points
- Example:
  ```javascript
  import { startApp } from './core/index.js';
  // Dynamic import for handlers
  const { clearConfig } = await import('../config/config.js');
  ```

### Code Organization Principles
- **Modular Architecture**: Core logic separated into `src/core/`, CLI handling in `src/cli/`, UI in `src/ui/`
- **Separation of Concerns**: Each module handles specific functionality (config, commands, output, etc.)
- **CLI-Driven**: Commander.js for argument parsing and command registration
- **Async/Await**: Consistent use of async patterns for I/O operations

### Linting and Formatting
- Follow standard JavaScript conventions
- Use ESLint for code quality (configure as needed)
- Prettier for consistent formatting
- JSDoc comments for public APIs and complex functions

## Dev environment tips

### Common Development Commands
```bash
# Development mode (if watch mode implemented)
npm run dev

# Check for updates manually
npm update @lukaloehr/context-engine

# Clear configuration
context --clear-config

# Change AI model
context --change-model
```

### Build and Deployment Processes
- **Global Installation**: `npm install -g .` for development
- **Local Testing**: `npm link` in project directory, then use `context` globally
- **Packaging**: No build step required; direct NPM publication
- **Version Updates**: Update `package.json` version and run `npm publish`

### Environment Setup Requirements
- **Node.js**: Version 16.0.0 or higher
- **API Keys**: XAI API key required for chat functionality
- **Global Access**: Install with `-g` flag for CLI access
- **File Permissions**: Ensure executable permissions on `bin/context.js`

### Troubleshooting Tips
- **API Key Issues**: Verify `XAI_API_KEY` in `.env` file
- **Module Resolution**: Ensure `"type": "module"` in package.json
- **Permission Errors**: Use `sudo` for global installation if needed
- **Dynamic Imports**: Watch for circular dependency issues in command handlers

### Performance Considerations
- **Token Limits**: Monitor GPT tokenizer for prompt length
- **Caching**: Configuration stored via `conf` package
- **Update Checks**: Daily update notifications via `update-notifier`
- **Async Operations**: Non-blocking I/O for better CLI responsiveness

## Testing instructions

### Test Commands
Currently, the project lacks comprehensive test suite. Basic placeholder exists:

```bash
# Current test command (needs implementation)
npm test
```

### Test Structure and Organization
- **Unit Tests**: Planned for core functions (config, API calls, CLI parsing)
- **Integration Tests**: For end-to-end chat sessions and project context
- **E2E Tests**: Interactive CLI flows and user prompts

### Testing Frameworks (Recommended)
- **Unit Testing**: Jest or Node.js `test` runner
- **CLI Testing**: `execa` for command execution testing
- **API Testing**: Mock XAI API responses for reliable testing

### Coverage Requirements
- **Minimum Coverage**: 80% for core functionality
- **Critical Paths**: Configuration, API integration, CLI command handling
- **Mocking Strategy**: Mock external API calls and file system operations

### CI/CD Setup
- **GitHub Actions**: Basic workflow for linting and testing
- **Pre-publish Checks**: Validate package structure and dependencies
- **Version Validation**: Semantic versioning enforcement

## PR instructions

### Pull Request Process
1. **Fork and Clone**: Fork the repository and clone your fork
2. **Branch Naming**: Use descriptive branch names (e.g., `feature/new-command`, `fix/api-error-handling`)
3. **Development Setup**: Run `npm install` and test locally with `npm link`

### Code Review Requirements
- **Code Style**: Follow existing patterns and conventions
- **Documentation**: Update JSDoc comments and README for new features
- **Testing**: Add tests for new functionality (minimum 70% coverage for new code)
- **Changelog**: Document changes in `CHANGELOG.md` following semantic versioning

### Versioning Strategy
- **Semantic Versioning**: MAJOR.MINOR.PATCH format
- **Pre-releases**: Use `--preid` for beta testing (e.g., `npm version 4.1.0-beta.1`)
- **Breaking Changes**: Increment MAJOR version, provide migration guide

### Release Process
1. **Prepare Release**:
   ```bash
   npm version patch # or minor/major
   git push && git push --tags
   ```
2. **Publish to NPM**:
   ```bash
   npm publish --access public
   ```
3. **Post-Release**: Update documentation, announce on social channels

### Documentation Requirements
- **Inline Comments**: JSDoc for public APIs and complex logic
- **README Updates**: Document new features and usage examples
- **AGENTS.md**: Update setup and development instructions
- **CHANGELOG.md**: Maintain detailed change history

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*
