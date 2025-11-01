# Context Engine AGENTS.md

Context Engine is an interactive AI-powered CLI tool that enables developers to chat with their codebase using advanced AI models like XAI Grok. It analyzes project structure, provides instant code insights, and assists with development tasks through natural language conversations.

## Project Overview

Context Engine transforms codebases into interactive AI assistants. By combining sophisticated prompt engineering with AI language models, it allows developers to ask questions about code, get explanations, debug issues, and receive suggestions directly from the command line. Key features include multi-model support (XAI Grok, OpenAI), intelligent context gathering, token optimization, syntax-highlighted responses, and persistent configuration.

## Setup commands

### Prerequisites
- Node.js >=16.0.0
- npm or yarn
- API key for AI provider (XAI, OpenAI, etc.)

### Installation
```bash
npm install -g @lukaloehr/context-engine
```

### Verify Installation
```bash
context --version
```

### Initial Setup
Run `context` to configure:
- Select AI model (default: XAI Grok)
- Enter API key (stored securely)
- Set default project directory

### Environment Variables
```bash
export XAI_API_KEY="your-api-key"
# or
export OPENAI_API_KEY="your-openai-key"
```

### Development Setup
```bash
git clone https://github.com/luka-loehr/context-engine.git
cd context-engine
npm install
# Create .env with API keys
npm run dev  # Run development version
```

## Code style

- **Language and Module System**: ES modules (import/export syntax) with Node.js >=16
- **Naming Conventions**: camelCase for variables/functions, PascalCase for classes, descriptive names
- **Import/Export Patterns**: Named imports/exports; group by external, internal, then local; avoid default imports
- **Code Organization Principles**: Modular architecture with core/, utils/, and handlers/ directories; single responsibility per module; JSDoc comments for public APIs
- **Linting and Formatting**: Follow Airbnb JavaScript style guide; use ESLint for linting; Prettier for formatting (configure in package.json if added)

## Dev environment tips

### Common Development Commands
- `npm run dev`: Run development server
- `npm test`: Run tests (currently placeholder)
- `node bin/context.js`: Run CLI directly
- `npm run postinstall`: Execute post-install setup

### Build and Deployment
- No build step required (ES modules)
- Publish to npm: Update version in package.json, then `npm publish --access public`
- Global installation for testing: `npm install -g .`

### Environment Setup
- Use `.env` file for API keys during development
- Set `NODE_ENV=development` for verbose logging if implemented
- Ensure cross-platform compatibility (Windows, macOS, Linux)

### Troubleshooting Tips
- API key issues: Verify environment variables or re-run setup
- Module resolution: Check Node.js version and ES module support
- Token limits: Monitor prompt sizes in AI responses
- Update notifications: Handled automatically via update-notifier

### Performance Considerations
- Optimize token usage in prompts for cost efficiency
- Cache configurations with Conf library
- Use async/await for I/O operations to avoid blocking

## Testing instructions

### Test Commands
```bash
npm test  # Currently echoes error (no tests implemented)
```

### Test Structure and Organization
- Tests should be added in a `tests/` or `__tests__/` directory
- Use Jest or similar framework (not currently configured)
- Focus on unit tests for core functions (AI integration, CLI handlers) and integration tests for full workflows

### Testing Frameworks
- None implemented; recommend Jest for comprehensive testing
- Mock AI API calls to avoid real requests during tests

### CI/CD Setup
- No CI configured; recommend GitHub Actions for linting, testing, and npm publishing
- Add workflows for pull requests and releases

### Coverage Requirements
- Aim for >80% coverage on new features
- Test edge cases: invalid API keys, empty projects, large codebases

## PR instructions

### Pull Request Process
1. Fork the repository and create a feature branch: `git checkout -b feature/description`
2. Make changes and commit with descriptive messages: `git commit -m "Add feature: description"`
3. Push branch: `git push origin feature/description`
4. Create Pull Request on GitHub targeting `main` branch

### Code Review Requirements
- Follow Airbnb style guide and existing patterns
- Add JSDoc for new public APIs
- Include tests for new functionality
- Update README.md for user-facing changes
- Ensure no breaking changes without version bump

### Versioning Strategy
- Semantic versioning (SemVer): MAJOR.MINOR.PATCH
- Update `package.json` version before merging to main
- Use `npm version` command for automated tagging

### Release Process
1. Merge PR to `main`
2. Update version: `npm version patch/minor/major`
3. Publish: `npm publish --access public`
4. Create GitHub release with changelog
5. Update documentation and examples

### Documentation Requirements
- Update README.md for new features/commands
- Add usage examples in documentation sections
- Maintain consistency in CLI help output
- Document any breaking changes in release notes

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*