# context-engine AGENTS.md

Interactive AI-powered codebase assistant using XAI Grok - chat with your code and get instant answers.

## Project Overview

context-engine is a CLI tool that enables developers to interact with their codebase using AI. It leverages XAI Grok to provide intelligent assistance, code analysis, and instant answers about project structure, dependencies, and implementation details. The tool supports codebase exploration, file content retrieval, and AI-driven insights for development workflows.

## Setup commands

### Installation
```bash
npm install -g @lukaloehr/context-engine
```

### Development Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/luka-loehr/context-engine.git
   cd context-engine
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the project root
   - Add your XAI API key: `XAI_API_KEY=your_api_key_here`

4. Run post-install script (executes automatically):
   ```bash
   npm run postinstall
   ```

### Starting the Application
```bash
# Global installation
context

# Development mode
npm start
# or
node bin/context.js
```

### Running Tests
```bash
npm test
```
Note: Current test suite is placeholder. Implement comprehensive tests for core functionality.

## Code style

### Language and Module System
- **Language**: Modern JavaScript (ES2022+)
- **Module System**: ES Modules (`type: "module"` in package.json)
- **Node.js Version**: >=16.0.0

### Naming Conventions
- **Files**: kebab-case (e.g., `context-engine.js`)
- **Functions/Variables**: camelCase (e.g., `startApp`, `apiKey`)
- **Classes**: PascalCase (if used)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_TIMEOUT`)

### Import/Export Patterns
- Use named imports/exports for better tree-shaking
- Relative imports within modules, absolute for external dependencies
- Group imports: standard libraries first, then external, then internal

Example:
```javascript
import dotenv from 'dotenv';
import { startApp } from './core/app.js';
```

### Code Organization Principles
- **Modular Architecture**: Separate concerns into `src/core/`, `src/utils/`, `src/services/`
- **CLI Entry Point**: `bin/context.js` handles environment setup and main execution
- **Main Logic**: `src/index.js` orchestrates application startup
- **Configuration**: Use `conf` package for persistent settings
- **Error Handling**: Centralized error management with graceful fallbacks

### Linting and Formatting
- No specific linter configured (add ESLint/Prettier for contributions)
- Follow Airbnb JavaScript style guide
- Use consistent indentation (2 spaces)
- ES module syntax throughout

## Dev environment tips

### Common Development Commands
```bash
# Development server (if applicable)
npm run dev

# Build for production
npm run build

# Clean install
rm -rf node_modules package-lock.json && npm install

# Check for updates
npm outdated
```

### Environment Setup Requirements
- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **XAI API Key**: Required for AI functionality (set in `.env`)
- **Global Installation**: Recommended for CLI usage (`npm install -g`)

### Build and Deployment Processes
1. **Local Testing**:
   ```bash
   # Link for local development
   npm link
   
   # Test globally
   context --help
   ```

2. **Release Process**:
   - Update version in `package.json`
   - Run `npm run build` (if build step added)
   - Create release tag: `git tag vX.Y.Z`
   - Publish: `npm publish --access public`

### Troubleshooting Tips
- **Module Resolution Issues**: Ensure `type: "module"` is set and using `.js` extensions
- **Environment Variables**: Verify `.env` file location and `dotenv` configuration
- **Permission Errors**: Use `sudo` for global installs or configure npm prefix
- **API Rate Limits**: Implement retry logic for XAI API calls
- **Token Limits**: Monitor `gpt-tokenizer` usage for prompt optimization

### Performance Considerations
- **File Watching**: Use efficient file system watchers for large codebases
- **Caching**: Implement response caching for repeated queries
- **Async Operations**: Leverage async/await for I/O operations
- **Memory Management**: Monitor memory usage during large codebase analysis

## Testing instructions

### Test Commands
```bash
# Run all tests
npm test

# Run tests with coverage (implement when tests added)
npm run test:coverage

# Run specific test file
npm test -- src/core/app.test.js
```

### Test Structure and Organization
- **Unit Tests**: Test individual functions and modules in `tests/unit/`
- **Integration Tests**: Test CLI interactions and API calls in `tests/integration/`
- **E2E Tests**: Test complete workflows in `tests/e2e/`
- **Mocking**: Use Jest or similar for API mocking

### Testing Frameworks Used
- **Current**: Placeholder (no tests implemented)
- **Recommended**: 
  - **Jest** or **Vitest** for unit/integration testing
  - **Supertest** for API testing
  - **Playwright** for E2E testing

### Test Best Practices
1. **Test Coverage**: Aim for 80%+ coverage of core functionality
2. **Mock External Dependencies**: Mock XAI API, file system operations
3. **CLI Testing**: Test command-line interface with `execa` or similar
4. **Edge Cases**: Test empty codebases, large files, network failures

### CI/CD Setup
```yaml
# Example GitHub Actions workflow
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build
```

### Coverage Requirements
- Core functionality: 90% coverage
- Utility functions: 80% coverage
- CLI commands: 100% coverage of main paths
- Error handling: Comprehensive test coverage

## PR instructions

### Pull Request Process
1. **Fork and Clone**:
   ```bash
   git clone https://github.com/luka-loehr/context-engine.git
   git checkout -b feature/your-feature-name
   ```

2. **Development Workflow**:
   - Create feature branch from `main`
   - Commit with conventional commits: `feat: add new feature` or `fix: resolve bug`
   - Keep commits atomic and focused

3. **Before Submitting**:
   - Run tests: `npm test`
   - Lint code: `npm run lint` (implement linter)
   - Update documentation
   - Ensure clean git history

### Code Review Requirements
- **Code Quality**:
  - Follow existing code style and patterns
  - Add comprehensive tests for new features
  - Update relevant documentation
  - No breaking changes without deprecation warnings

- **Commit Standards**:
  - Use conventional commit messages
  - Include issue references: `Fixes #123`
  - Keep PRs focused (single responsibility)

- **Testing**:
  - All tests must pass
  - New features require test coverage
  - Performance impact must be documented

### Versioning Strategy
- **Semantic Versioning**: MAJOR.MINOR.PATCH
- **Pre-releases**: Use alpha/beta tags for major changes
- **Changelog**: Maintain `CHANGELOG.md` with release notes

### Release Process
1. **Prepare Release**:
   ```bash
   # Update version
   npm version patch # or minor, major
   
   # Update changelog
   npm run changelog
   ```

2. **Publish**:
   ```bash
   # Create release tag
   git push origin main --tags
   
   # Publish to npm
   npm publish --access public
   ```

3. **Post-Release**:
   - Update GitHub release notes
   - Notify community of new version
   - Monitor for issues

### Documentation Requirements
- **Inline Comments**: Document complex logic and non-obvious decisions
- **README Updates**: Document new features and usage
- **AGENTS.md Updates**: Keep AI agent instructions current
- **API Documentation**: Document exported functions and CLI options

### Contribution Guidelines
- All contributions welcome (features, bug fixes, documentation)
- No cryptocurrency or blockchain-specific contributions
- Maintain focus on AI-powered development assistance
- Respect existing architecture and design decisions

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*