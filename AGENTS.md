# Context-Engine AGENTS.md

Context-Engine is an interactive AI-powered CLI tool that enables developers to chat with their codebase using XAI Grok. It provides instant answers to questions about code structure, dependencies, and functionality by analyzing project files in real-time.

## Project Overview

Context-Engine transforms your codebase into an interactive conversation partner. Using advanced AI models from XAI, it understands your project's architecture and can explain components, suggest improvements, and answer technical questions. Key features include real-time file analysis, multi-model support, interactive chat interface, tool integration, sub-agent system for documentation generation, and session management. Use cases include code reviews, onboarding, debugging assistance, and automated documentation.

## Setup commands

### Prerequisites
- Node.js >= 16.0.0
- XAI API key (obtain from [x.ai](https://x.ai))

### Installation
```bash
npm install -g @lukaloehr/context-engine
```

### Configuration
Create `.env` file in project root:
```
XAI_API_KEY=your_xai_api_key_here
```
Or set as environment variable:
```bash
export XAI_API_KEY=your_xai_api_key_here
```

### Development Setup
```bash
git clone https://github.com/luka-loehr/context-engine.git
cd context-engine
npm install
cp .env.example .env
npm link  # For global testing
```

### Starting the Application
```bash
context  # Start interactive session
context --version  # Check version
context --help     # Show options
```

### Testing
```bash
npm test  # Currently minimal tests
```

The post-install script automatically configures the tool and checks for updates.

## Code style

- **Language and Module System**: ES modules (import/export syntax) with Node.js >= 16.0.0
- **Naming Conventions**: camelCase for variables/functions, PascalCase for classes, descriptive names
- **Import/Export Patterns**: Named exports preferred; relative imports for local modules, absolute for dependencies
- **Code Organization**: Modular architecture with `src/core/` for core logic, `bin/` for CLI entry, `scripts/` for utilities
- **Documentation**: Comprehensive JSDoc comments for public APIs
- **Linting/Formatting**: Follow [JavaScript Standard Style](https://standardjs.com/); run `npm run lint` before commits
- **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/) specification

Ensure cross-platform compatibility and add descriptive comments for complex logic.

## Dev environment tips

### Common Development Commands
```bash
npm run lint     # Check code style
npm link         # Link for global testing
context --clear-config  # Reset configuration
```

### Build and Deployment
- No separate build step; uses ES modules directly
- For publishing: Update version in package.json, `npm publish`
- Global installation handles distribution

### Environment Setup
- Set XAI_API_KEY in `.env` for development
- Use `dotenv` for loading environment variables
- Test API connectivity before development sessions

### Troubleshooting
- **API Errors**: Verify XAI_API_KEY and network connectivity
- **Module Resolution**: Ensure Node.js >= 16 and clean `node_modules`
- **Permission Issues**: Use `sudo` for global installs if needed (macOS/Linux)
- **Update Issues**: Run `npm update` or check with update-notifier

### Performance Considerations
- Monitor token usage with built-in tracking
- Limit concurrent file analysis for large projects
- Use streaming responses for better UX
- Cache configuration with `conf` package to avoid repeated loads

## Testing instructions

### Test Commands
```bash
npm test  # Run available tests (currently minimal)
```

### Test Structure
- Tests located in project root (expand with comprehensive suite)
- Focus on CLI functionality, API integration, and file analysis
- Use Node.js built-in test runner or add framework like Jest

### Testing Best Practices
- Test edge cases for file loading and error recovery
- Mock API calls to avoid rate limits during testing
- Ensure cross-platform test execution
- Add tests for new features before PR submission

### CI/CD Setup
- No current CI configuration; recommend GitHub Actions for linting and tests
- Run `npm test` and `npm run lint` in CI pipeline
- Test on Node.js 16+ versions

### Coverage Requirements
- Aim for >80% coverage on core functionality
- Prioritize testing CLI commands, file access tools, and AI response handling

Contributions adding comprehensive tests are encouraged.

## PR instructions

### Pull Request Process
1. Fork the repository and create a feature branch: `git checkout -b feature/description`
2. Make changes and add tests
3. Ensure code passes linting: `npm run lint`
4. Commit with Conventional Commits format
5. Push branch and open PR against `main`
6. Include detailed description of changes and motivation

### Code Review Requirements
- Follow JavaScript Standard Style
- Add JSDoc for new public APIs
- Update documentation (README.md, examples)
- Ensure no breaking changes without version bump
- Test changes locally with `npm link`

### Versioning Strategy
- Semantic versioning (SemVer) in package.json
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes
- Update changelog for releases

### Release Process
1. Merge PR to `main`
2. Update version: `npm version [major|minor|patch]`
3. Publish: `npm publish`
4. Create GitHub release with changelog
5. Update documentation and examples

### Documentation Requirements
- Update README.md for user-facing changes
- Add examples for new features
- Document API changes in code comments
- Include migration guides for breaking changes

All contributions must adhere to the MIT License terms.

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*