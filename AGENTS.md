# @lukaloehr/context-engine AGENTS.md

Interactive AI-powered CLI tool that enables developers to chat with their codebase using XAI Grok, providing instant answers and insights directly from source code.

## Project Overview

@lukaloehr/context-engine is a command-line interface (CLI) application that integrates AI capabilities to analyze and interact with codebases. It uses the XAI Grok model to understand project structure, answer queries about code, and assist with development tasks. The tool processes code files, generates context-aware prompts, and delivers conversational responses, making it an essential assistant for code exploration and debugging.

## Setup commands

### Installation
```bash
npm install -g @lukaloehr/context-engine
```

### Environment Setup
Create a `.env` file in your project root with your XAI API credentials:
```
XAI_API_KEY=your_api_key_here
```

### Starting the Tool
Navigate to your project directory and run:
```bash
context
```
This launches the interactive CLI session.

### Post-Installation
The `postinstall` script runs automatically to set up configurations. For manual setup:
```bash
npm run postinstall
```

No additional servers are required; the tool operates as a standalone CLI.

## Code style

### Language and Module System
- JavaScript (ES modules) with `"type": "module"` in package.json
- Node.js runtime (version >=16.0.0)

### Naming Conventions
- CamelCase for variables, functions, and methods
- PascalCase for classes and components
- kebab-case for file names and CLI commands

### Import/Export Patterns
- Use named imports/exports: `import { functionName } from './module.js'`
- Relative imports for local modules: `./` or `../`
- Avoid default imports unless necessary for third-party libraries

### Code Organization
- Modular structure: `bin/` for CLI entry, `src/` for core logic, `scripts/` for utilities
- Single responsibility principle: Each module handles specific functionality (e.g., prompt generation, API interaction)
- Error handling with try-catch blocks and descriptive messages

### Linting and Formatting
- No built-in linting specified; recommend ESLint with Airbnb style guide
- Use Prettier for code formatting
- Maintain consistent indentation (2 spaces) and semicolons

## Dev environment tips

### Common Development Commands
- Run the CLI locally: `node bin/context.js`
- Check for updates: The tool uses `update-notifier` to alert on new versions
- Token estimation: Leverages `gpt-tokenizer` for prompt optimization

### Build and Deployment
- No build step required; publish directly via npm
- Global installation preferred (`npm install -g`)
- Files included: `bin/`, `src/`, `scripts/`, `LICENSE`

### Environment Requirements
- Node.js >=16.0.0
- XAI API access for Grok integration
- `.env` file for sensitive configurations (loaded via `dotenv`)

### Troubleshooting
- If API calls fail, verify `XAI_API_KEY` in `.env`
- For token limit issues, reduce context size in prompts
- Use `chalk` and `ora` for colored, spinner-based output in development

### Performance Considerations
- Optimize prompts with `gpt-tokenizer` to stay under API limits
- Cache configurations using `conf` to avoid repeated setups
- Limit file scanning to relevant directories for large codebases

## Testing instructions

### Test Commands
Currently, no tests are implemented. To add:
```bash
npm run test
```
This echoes an error; implement with a framework like Jest.

### Test Structure
- Organize tests in a `tests/` directory mirroring `src/`
- Unit tests for core functions (e.g., prompt building, file parsing)
- Integration tests for CLI interactions using `inquirer`

### Testing Frameworks
- Recommend Jest or Mocha for unit/integration testing
- Use `sinon` for mocking API calls to XAI/OpenAI

### CI/CD Setup
- Add GitHub Actions workflow for automated testing on pull requests
- Include linting and coverage checks (aim for >80% coverage)

### Coverage Requirements
- No current requirements; target comprehensive coverage for new features
- Mock external dependencies (e.g., OpenAI API) to ensure reliable tests

## PR instructions

### Pull Request Process
- Fork the repository and create a feature branch: `git checkout -b feature/description`
- Ensure all code passes manual review and follows style guidelines
- Update documentation for new features

### Code Review Requirements
- Changes must be atomic and focused on single concerns
- Include tests for new functionality
- Document any breaking changes in commit messages

### Versioning Strategy
- Semantic versioning (SemVer): MAJOR.MINOR.PATCH
- Update `package.json` version before releases
- Use conventional commits for changelog generation

### Release Process
- Bump version: `npm version [major|minor|patch]`
- Publish to npm: `npm publish --access public`
- Tag release on GitHub and update README

### Documentation Requirements
- Update README.md for user-facing changes
- Add examples in code comments for complex logic
- Ensure AGENTS.md reflects any workflow updates

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*