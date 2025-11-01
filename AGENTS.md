# Context Engine AGENTS.md

Context Engine is an interactive AI-powered CLI tool that enables developers to chat with their codebase using advanced AI models like XAI Grok. It provides instant answers, code analysis, and contextual insights directly from project files.

## Project Overview

Context Engine transforms codebases into interactive conversation partners. Developers can ask natural language questions about their projects and receive intelligent, context-aware responses. Key capabilities include debugging assistance, code explanations, architecture analysis, and rapid prototyping support. The tool automatically extracts project structure, dependencies, and relevant files to provide accurate AI responses. Built for solo developers, teams, and educational use, it accelerates understanding and development workflows.

## Setup commands

### Prerequisites
- Node.js >= 16.0.0
- npm or yarn package manager
- API key for XAI Grok (or compatible AI provider like OpenAI)

### Installation
```bash
# Install globally
npm install -g @lukaloehr/context-engine

# Verify installation
context --version
```

### Initial Configuration
```bash
# Run first time to set up API key
context

# Or create .env file manually
echo "XAI_API_KEY=your_api_key_here" > .env
```

### Development Setup
```bash
# Clone repository
git clone https://github.com/luka-loehr/context-engine.git
cd context-engine

# Install dependencies
npm install

# Link for global development use
npm link

# Test CLI
context --version
```

### Post-Installation
A postinstall script runs automatically. To reset configuration:
```bash
context clear-config
```

## Code style

### Language and Module System
- ES modules (import/export syntax)
- Node.js >= 16.0.0
- Type: "module" in package.json

### Naming Conventions
- camelCase for variables and functions
- PascalCase for classes and components
- Descriptive, intention-revealing names
- Follow Airbnb JavaScript style guide

### Import/Export Patterns
```javascript
// Named imports (preferred)
import { startApp } from './core/index.js';

// Default imports for main modules
import startApp from './app.js';

// Export named functions and constants
export { initializeApp, startApp };
```

### Code Organization Principles
- Modular architecture with clear separation of concerns
- Core functionality in `src/core/`
- CLI entry in `bin/context.js`
- Scripts in `scripts/` directory
- Utility functions grouped by purpose
- JSDoc comments for public APIs

### Linting and Formatting
- No specific linter configured (follow Airbnb style manually)
- Consistent indentation (2 spaces)
- Single quotes for strings
- Semicolons required

## Dev environment tips

### Common Development Commands
```bash
# Run in development mode
npm link
context --model grok-beta

# Check for updates
npx update-notifier

# Clear configuration
context clear-config

# View help
context --help
```

### Build and Deployment
- No build step required (pure JS modules)
- Publish via npm: `npm publish --access public`
- Global installation handles distribution

### Environment Setup Requirements
- Set `XAI_API_KEY` in `.env` or via interactive prompts
- `NODE_ENV=development` for local testing
- Ensure global npm link for CLI testing

### Troubleshooting Tips
- API key issues: Run `context clear-config` and reconfigure
- Module resolution: Verify `"type": "module"` in package.json
- Permission errors: Use `sudo` for global installs on Unix systems
- Token limits: Monitor with built-in gpt-tokenizer

### Performance Considerations
- Efficient file scanning (limits deep directory traversal)
- Token management prevents oversized prompts
- Caching for repeated queries via conf library
- Async operations for non-blocking I/O

## Testing instructions

### Current Testing Status
The project currently lacks comprehensive test coverage. The package.json includes a placeholder test script:
```bash
npm test  # Echoes error message (no tests implemented)
```

### Test Structure Recommendations
- Unit tests for core functions (app.js, ai.js, config.js)
- Integration tests for CLI interactions
- Mock API responses for AI model testing
- Test project fixtures for context extraction

### Testing Frameworks (Recommended)
- Jest or Vitest for unit and integration tests
- Sinon for mocking dependencies
- Testing Library for CLI output validation

### Test Commands (To Implement)
```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

### CI/CD Setup
- Add GitHub Actions workflow for automated testing
- Include linting step in CI pipeline
- Test across Node.js versions (16, 18, 20)
- Coverage threshold: Aim for 80%+

### Best Practices
- Test API key configuration flow
- Mock external AI services
- Validate file parsing and context extraction
- Ensure cross-platform compatibility

## PR instructions

### Pull Request Process
1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make changes and ensure code follows style guidelines
3. Add or update tests for new functionality
4. Update documentation (README.md, inline comments)
5. Commit with descriptive messages following conventional commits
6. Push branch and open pull request against main

### Code Review Requirements
- Follow Airbnb JavaScript style guide
- Include tests for new features (aim for 80%+ coverage)
- Update relevant documentation
- No breaking changes without deprecation warnings
- Clear PR description with motivation and changes

### Versioning Strategy
- Semantic versioning (SemVer): MAJOR.MINOR.PATCH
- MAJOR for breaking changes
- MINOR for new features (backward compatible)
- PATCH for bug fixes
- Update CHANGELOG.md for all releases

### Release Process
1. Merge PR to main branch
2. Create release tag:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
3. Publish to npm:
   ```bash
   npm version X.Y.Z
   npm publish --access public
   ```
4. Update GitHub release notes
5. Notify users via update-notifier

### Documentation Requirements
- Update README.md for user-facing changes
- Add JSDoc comments for new public APIs
- Include migration guides for breaking changes
- Test new features with example usage
- Ensure inline comments explain complex logic

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*