# Context Engine AGENTS.md

Interactive AI-powered codebase assistant that enables developers to chat with their code using XAI Grok, providing instant answers and insights about the codebase.

## Project Overview

Context Engine is a CLI tool that integrates AI capabilities to analyze and interact with codebases. It uses advanced prompt engineering to help developers understand, navigate, and get assistance from their projects through natural language queries. The tool supports multiple AI models and provides contextual responses based on the project's structure and code.

## Setup commands

### Installation
```bash
npm install -g @lukaloehr/context-engine
```

### Initial Setup
```bash
# Run the CLI for first-time setup
context

# Or with specific options
context --setup
```

### Environment Configuration
Create a `.env` file in your project root or home directory:
```bash
XAI_API_KEY=your_xai_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional for other models
```

### Development Setup
```bash
# Clone the repository
git clone https://github.com/luka-loehr/context-engine.git
cd context-engine

# Install dependencies
npm install

# Run postinstall script (runs automatically)
npm run postinstall
```

### Starting the Application
```bash
# Global CLI
context

# Development mode
node bin/context.js

# With specific model
context --model grok
```

## Code style

### Language and Module System
- **Language**: Modern JavaScript (ES2022+)
- **Module System**: ES Modules (`"type": "module"`)
- **Node.js Version**: >= 16.0.0

### Naming Conventions
- **Variables/Functions**: camelCase (e.g., `startApp`, `getProjectContext`)
- **Classes**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case for CLI scripts, PascalCase for components

### Import/Export Patterns
- Use named exports for utilities and functions
- Use default exports sparingly
- Dynamic imports for command handlers to avoid circular dependencies
- Relative imports within modules, absolute from core entry points

### Code Organization
- **Modular Architecture**: Core logic separated into `src/core/`, CLI in `src/cli/`, commands in `src/commands/`
- **Separation of Concerns**: UI, config, and business logic in distinct modules
- **Async/Await**: Preferred over Promise chains for all async operations
- **Error Handling**: Centralized error handling with graceful fallbacks

### Linting and Formatting
- Follow Airbnb JavaScript style guide
- Use ESLint for linting (configure as needed)
- Prettier for code formatting
- JSDoc comments for all public APIs and complex functions

## Dev environment tips

### Common Development Commands
```bash
# Run in development
npm start  # Alias for node bin/context.js

# Debug mode
DEBUG=context-engine node bin/context.js

# Check for updates manually
context --check-updates

# Clear configuration
context --clear-config
```

### Build and Deployment
- **No build step required**: ES modules run directly in Node.js
- **Global Installation**: `npm install -g .` from project root
- **Version Publishing**: Update `package.json` version, then `npm publish`

### Environment Setup Requirements
- Node.js >= 16.0.0
- Global npm packages: None required beyond project dependencies
- API Keys: XAI or OpenAI API key required for AI functionality
- File Permissions: Write access to `~/.config/context-engine` for configuration

### Troubleshooting Tips
- **API Key Issues**: Verify `.env` file location and format
- **Module Resolution**: Ensure `"type": "module"` in package.json
- **Permission Errors**: Run with `sudo` for global installation if needed
- **Update Check Fails**: Check network connectivity and firewall settings
- **Import Errors**: Verify Node.js version meets requirements

### Performance Considerations
- **Token Limits**: Monitor GPT tokenizer for large codebases
- **Caching**: Configuration and model selection cached locally
- **Async Operations**: All API calls and file operations are non-blocking
- **Memory Usage**: Highlight.js syntax highlighting optimized for CLI output

## Testing instructions

### Current Testing Status
The project currently lacks comprehensive test coverage. Basic test placeholder exists but needs implementation.

### Test Commands
```bash
# Current placeholder (will show error)
npm test

# To add testing, install a framework like Jest:
npm install --save-dev jest @jest/globals
```

### Recommended Test Structure
```
tests/
├── unit/
│   ├── core/
│   ├── cli/
│   └── commands/
├── integration/
│   ├── api/
│   └── workflow/
└── fixtures/
    ├── sample-projects/
    └── mock-responses/
```

### Testing Frameworks Recommendation
- **Unit Testing**: Jest with `@jest/globals` for ES modules
- **Integration Testing**: Jest with supertest for CLI testing
- **E2E Testing**: Playwright or custom CLI test runners
- **Coverage**: Aim for 80%+ coverage on core logic

### CI/CD Setup
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
      - run: npm run build  # If build step added
```

### Testing Best Practices
- Mock external API calls (XAI, OpenAI)
- Test CLI argument parsing and validation
- Verify configuration persistence and retrieval
- Test error handling for network failures
- Include token counting and prompt size validation

## PR instructions

### Contribution Guidelines
1. **Fork and Clone**: Fork the repository and clone your fork
2. **Branching**: Create feature branches from `main` (e.g., `feature/add-jest-testing`)
3. **Development**: Ensure all tests pass and code follows style guidelines

### Pull Request Process
1. **Update Documentation**: Ensure README and relevant docs are updated
2. **Test Coverage**: Add tests for new features, maintain existing coverage
3. **Changelog**: Add entry to `CHANGELOG.md` for significant changes
4. **PR Template**: Use the provided PR template with clear description

### Code Review Requirements
- **Self-Review**: Ensure code is clean, documented, and tested
- **Peer Review**: At least one approval from core contributor
- **CI Checks**: All automated tests and linting must pass
- **Security**: No hardcoded API keys or sensitive information

### Versioning Strategy
- **Semantic Versioning**: Follow MAJOR.MINOR.PATCH format
- **Pre-releases**: Use `alpha`, `beta`, `rc` tags for testing
- **Breaking Changes**: Require MAJOR version bump with migration guide

### Release Process
```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Commit and push tags
git push origin main --tags

# 3. Create release on GitHub
# 4. Publish to npm
npm publish --access public

# 5. Update changelog and documentation
```

### Documentation Requirements
- **Inline Comments**: JSDoc for all public APIs
- **README Updates**: Document new features and usage
- **AGENTS.md**: Update development instructions for new workflows
- **CHANGELOG.md**: Document all user-facing changes
- **Migration Guides**: For breaking changes in MINOR/MAJOR releases

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*