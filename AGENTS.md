# Context Engine AGENTS.md

Context Engine is an interactive AI-powered CLI tool that enables developers to chat with their codebase using XAI Grok, providing instant answers and insights about code structure, dependencies, and functionality.

## Project Overview
Context Engine (@lukaloehr/context-engine) is a command-line interface (CLI) application designed to assist developers in understanding and navigating complex codebases. It leverages AI (XAI Grok) to provide contextual explanations, code analysis, and interactive Q&A sessions about the codebase. The tool processes project files, extracts relevant context, and generates intelligent responses to developer queries. Built with modern Node.js modules, it supports tokenization, syntax highlighting, and interactive prompts for seamless developer experience.

## Setup commands
### Installation
```bash
# Install globally via npm
npm install -g @lukaloehr/context-engine

# Or clone and install locally
git clone https://github.com/luka-loehr/context-engine.git
cd context-engine
npm install
```

### Development Setup
- Ensure Node.js >=16.0.0 is installed
- Create a `.env` file in your project root with API keys:
  ```
  XAI_API_KEY=your_xai_grok_api_key
  ```
- Run postinstall script automatically handles initial setup

### Starting the Application
```bash
# Global CLI usage (in any project directory)
context

# Local development
npm start
# Or directly
node bin/context.js
```

### Running Tests
```bash
npm test
```
Note: Current test suite is placeholder; implement comprehensive tests for core functionality.

### Additional Setup
- The tool auto-configures via `conf` package for user settings
- Update notifier checks for new versions on startup

## Code style
### Language and Module System
- ES6+ JavaScript with ES modules (`"type": "module"`)
- Node.js runtime targeting >=16.0.0

### Naming Conventions
- CamelCase for variables, functions, and methods
- PascalCase for classes and components
- kebab-case for CLI flags and file names where appropriate

### Import/Export Patterns
- Named exports for modular components: `export { functionName } from './module.js'`
- Default exports for main entry points: `export default className`
- Relative imports for local modules, absolute for node_modules
- Group imports: external packages first, then internal modules

### Code Organization Principles
- Modular architecture: `src/core/` for business logic, `bin/` for CLI entry
- Separation of concerns: each module handles specific functionality (e.g., AI integration, file processing, UI)
- Configuration-driven: uses `dotenv` for environment, `conf` for user settings
- Error handling: async/await with try-catch blocks, graceful CLI exits

### Linting and Formatting
- No explicit linter configured; follow Airbnb JavaScript style guide
- Use consistent indentation (2 spaces) and semicolons
- Code should be self-documenting with JSDoc comments for public APIs

## Dev environment tips
### Common Development Commands
```bash
# Development server/watch mode (implement if needed)
npm run dev

# Build for production
npm run build  # Currently not configured; add if bundling required

# Lint code
npm run lint   # Add ESLint configuration

# Check dependencies
npm outdated
```

### Environment Setup Requirements
- Set `XAI_API_KEY` in `.env` for Grok integration
- Global installation requires write permissions for `~/.config/context-engine`
- For local dev, use `npm link` to test CLI globally

### Build and Deployment
- Publishing: Use `npm publish` from root (ensure `files` in package.json)
- The `postinstall` script runs automatically for setup
- Version updates via semantic versioning in package.json

### Troubleshooting Tips
- If CLI not found after global install: Check PATH or use `npx context`
- API rate limits: Monitor token usage via `gpt-tokenizer`
- File access issues: Ensure read permissions for codebase analysis
- Module resolution errors: Verify `"type": "module"` and .mjs extensions if needed

### Performance Considerations
- Large codebases: Tool processes files incrementally to manage memory
- Token limits: Uses `gpt-tokenizer` to optimize context windows
- Caching: User configurations persist via `conf` to avoid repeated setups

## Testing instructions
### Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode (add to scripts if needed)
npm run test:watch
```

### Test Structure and Organization
- Tests should be co-located with source files (e.g., `src/module.test.js`)
- Use descriptive test names following `describe/it` pattern
- Mock external dependencies (OpenAI/XAI APIs, file system) for unit tests

### Testing Frameworks
- Currently no tests implemented; recommend Jest or Node.js `test` runner
- Integration tests for CLI: Use `execa` to spawn processes
- Unit tests for core logic: Mock AI responses and file I/O

### CI/CD Setup
- Add GitHub Actions workflow for automated testing on PRs
- Include linting, test coverage, and security scans
- Sample `.github/workflows/test.yml`:
  ```yaml
  name: Test
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with: { node-version: 18 }
        - run: npm ci
        - run: npm test
  ```

### Coverage Requirements
- Aim for >80% coverage on core modules
- Focus on AI prompt generation, file parsing, and CLI interactions
- Exclude node_modules and build artifacts from coverage reports

## PR instructions
### Pull Request Process
1. Fork the repository and create a feature branch: `git checkout -b feature/description`
2. Ensure code passes linting and tests: `npm run lint && npm test`
3. Commit with conventional messages: `feat: add new feature` or `fix: resolve bug`
4. Push and open PR against `main` branch
5. Reference any related issues: `Fixes #123`

### Code Review Requirements
- All PRs require at least one approval from maintainers
- Changes must include tests for new features or bug fixes
- Update documentation (README, this AGENTS.md) for user-facing changes
- No breaking changes without deprecation warnings and migration guide

### Versioning Strategy
- Semantic versioning (SemVer): MAJOR.MINOR.PATCH
- MAJOR for breaking changes, MINOR for new features, PATCH for bug fixes
- Update `package.json` version and changelog before merging to main
- Tag releases: `git tag v4.0.1 && git push --tags`

### Release Process
1. Merge PR to `main` and ensure tests pass
2. Update version in `package.json`
3. Create release tag and push
4. Publish to npm: `npm publish --access public`
5. Update GitHub release notes with changelog
6. Notify users via update-notifier integration

### Documentation Requirements
- All public APIs must have JSDoc comments
- Update README.md for CLI usage examples and new features
- Add examples in codebase comments for complex logic
- Ensure AGENTS.md reflects any development workflow changes

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*