# Context Engine AGENTS.md

Context Engine is an interactive AI-powered CLI tool that enables developers to chat with their codebase using XAI Grok, providing instant answers and insights about code structure, dependencies, and functionality.

## Project Overview

Context Engine (@lukaloehr/context-engine) is a Node.js CLI application designed as an intelligent assistant for codebases. It leverages AI (XAI Grok) to analyze code, answer developer queries, and provide contextual insights. The tool supports interactive sessions where users can ask questions about their project's structure, dependencies, and implementation details. Built with modern ES modules and a modular architecture, it emphasizes ease of use and extensibility.

## Setup commands

### Installation
- Global installation (recommended for CLI usage): `npm install -g @lukaloehr/context-engine`
- Local installation: `npm install @lukaloehr/context-engine`

### Environment Setup
- Create a `.env` file in your project root with your XAI API credentials (e.g., `XAI_API_KEY=your_key_here`).
- Ensure Node.js >=16.0.0 is installed.

### Starting the Application
- Run the CLI: `context` (after global install) or `npx context-engine`.
- The tool will initialize an interactive session in the current directory.

### Post-Installation
- A postinstall script warns if not installed globally and guides users to reinstall with `-g`.

### Running Tests
- Basic test script is placeholder: `npm test` (currently echoes error; implement tests as needed).

## Code style

### Language and Module System
- ES Modules (\"type\": \"module\" in package.json).
- Node.js runtime with async/await patterns for I/O operations.

### Naming Conventions
- CamelCase for variables, functions, and methods.
- PascalCase for classes and exported modules.
- Kebab-case for package names and CLI commands.

### Import/Export Patterns
- Named exports for modular components (e.g., `export { startApp } from './core/app.js'`).
- Relative imports for internal modules (e.g., `import { main } from '../src/index.js'`).
- Avoid default exports; use named exports for clarity.

### Code Organization Principles
- Modular structure: `bin/` for CLI entry, `src/core/` for application logic, `scripts/` for utilities.
- Separation of concerns: Core app logic in `src/core/app.js`, entry points in `src/index.js`.
- JSDoc comments for documentation (e.g., `@author`, `@license`).

### Linting and Formatting
- No explicit linter specified; follow Node.js best practices.
- Use consistent indentation (2 spaces) and ES module syntax.
- Validate with ESLint or Prettier for contributions.

## Dev environment tips

### Common Development Commands
- Start dev server: Not applicable (CLI tool); use `node bin/context.js` for direct execution.
- Check updates: The tool includes `update-notifier` for version checks.
- Debug mode: Run with `NODE_DEBUG=context` for verbose logging.

### Build and Deployment
- No build step required; publish directly via `npm publish`.
- Global installation makes `context` command available system-wide.

### Environment Setup Requirements
- `.env` file for API keys (loaded via `dotenv`).
- Ensure `preferGlobal: true` in package.json for CLI behavior.

### Troubleshooting Tips
- If `context` command not found: Reinstall globally with `npm install -g`.
- API errors: Verify `XAI_API_KEY` in `.env` and network connectivity.
- Module resolution issues: Use Node.js >=16 and check ES module compatibility.

### Performance Considerations
- Token limits handled via `gpt-tokenizer`.
- Use `ora` for spinners to improve UX during AI processing.
- Minimize file reads; cache codebase analysis where possible.

## Testing instructions

### Test Commands
- Run tests: `npm test` (placeholder; extend with actual test suite).
- No tests currently implemented; add using a framework like Jest or Mocha.

### Test Structure and Organization
- Tests should be placed in a `tests/` or `__tests__/` directory.
- Focus on unit tests for core modules (e.g., app initialization, command handling).
- Integration tests for CLI interactions using tools like `execa`.

### CI/CD Setup
- Integrate with GitHub Actions for automated testing on pull requests.
- No current CI configuration; add `.github/workflows/` for Node.js testing.

### Testing Frameworks Used
- None specified; recommend Jest for ES modules and async testing.
- Mock external dependencies (e.g., OpenAI/XAI API) for reliable tests.

### Coverage Requirements
- Aim for >80% coverage on core logic.
- Use `nyc` or Jest coverage for reports.
- Test edge cases like invalid API keys and empty codebases.

## PR instructions

### Pull Request Process
- Fork the repository and create a feature branch: `git checkout -b feature/description`.
- Make changes and ensure code passes manual review (no automated tests yet).
- Commit with clear messages: `git commit -m "feat: add description"`.

### Code Review Requirements
- Follow existing code style (ES modules, JSDoc comments).
- Update documentation for new features.
- Test changes locally with `node bin/context.js`.

### Versioning Strategy
- Semantic versioning (SemVer) via `package.json` (current: 4.0.0).
- Major: Breaking changes; Minor: New features; Patch: Bug fixes.
- Update changelog in README or separate CHANGELOG.md.

### Release Process
- Bump version: `npm version [major|minor|patch]`.
- Publish: `npm publish` (requires npm access).
- Tag releases on GitHub for versioning.

### Documentation Requirements
- Update README.md with new features and usage examples.
- Add JSDoc comments to new/existing code.
- Ensure package.json keywords and description reflect changes.

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*