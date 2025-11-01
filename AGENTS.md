# context-engine AGENTS.md

Interactive AI-powered CLI tool for chatting with codebases using XAI Grok models. Enables natural language queries about project structure, code analysis, and file content.

## Project Overview

context-engine is a terminal-based assistant that loads entire codebases into AI context, allowing developers to ask questions in natural language and receive contextually-aware responses. Built with Node.js, it supports XAI's Grok models for fast, intelligent code analysis.

## Setup commands

### Installation
```bash
npm install -g @lukaloehr/context-engine
```

### Development Setup
```bash
git clone https://github.com/luka-loehr/context-engine.git
cd context-engine
npm install
npm link  # For local testing
```

### Environment Configuration
Set XAI API key:
```bash
export XAI_API_KEY="xai-your_api_key_here"
```
Or create `.env` file:
```env
XAI_API_KEY=xai-your_api_key_here
```

### Running the Application
```bash
cd your-project
context  # Start interactive chat
```

### Post-Installation
```bash
npm run postinstall  # Runs automatically after npm install
```

## Code style

- **Language**: ES6+ JavaScript with ES modules (`"type": "module"`)
- **Module System**: ES modules with `import/export` syntax
- **Naming Conventions**: 
  - camelCase for variables and functions
  - PascalCase for classes and components
  - UPPER_SNAKE_CASE for constants
- **Import Patterns**: 
  - Relative imports for local modules (e.g., `import { func } from '../utils.js'`)
  - Named imports for utilities (e.g., `import chalk from 'chalk'`)
  - Group imports by type: external, internal, local
- **Code Organization**:
  - Modular structure with dedicated directories (`src/commands/`, `src/providers/`, `src/utils/`)
  - Single responsibility principle for functions and modules
  - Async/await for all asynchronous operations
  - Error handling with try-catch blocks
- **Linting/Formatting**: No explicit linter specified; follow consistent indentation (2 spaces) and ES6+ best practices

## Dev environment tips

### Common Development Commands
```bash
npm link  # Link local version for testing
context   # Run the CLI in current directory
node bin/context.js  # Direct execution for debugging
```

### Build and Deployment
- No build step required (pure JS runtime)
- Global installation via `npm publish`
- Version updates follow semantic versioning in `package.json`

### Environment Setup Requirements
- Node.js >= 16.0.0
- XAI API key required for functionality
- System keychain access for secure API key storage (via `conf` package)

### Troubleshooting Tips
- **API Key Issues**: Use `/api` command in chat to import from `.env` or check environment variables
- **Model Not Found**: Defaults to 'context' model; check `src/constants/models.js` for available models
- **Context Loading**: Ensure project files are accessible; large projects may require token optimization
- **Spinner Issues**: Terminal compatibility problems; test in standard terminals (not all IDE terminals)

### Performance Considerations
- Token limits managed via `gpt-tokenizer` package
- Lazy loading of project context during chat sessions
- Streaming responses for better perceived performance
- Avoid loading entire large files; use targeted file access via tools

## Testing instructions

### Current Testing Status
No test suite implemented. Placeholder script exists:
```bash
npm test  # Outputs error message (no tests specified)
```

### Test Structure Recommendations
- Unit tests for utilities (`src/utils/`)
- Integration tests for providers (`src/providers/`)
- E2E tests for CLI commands using tools like `ava` or `jest`
- Mock API responses for provider testing

### Testing Frameworks
- Recommended: Jest or Ava for Node.js testing
- Mocking: `nock` for HTTP API mocking
- Coverage: Aim for 80%+ coverage on core utilities and providers

### CI/CD Setup
- No current CI configuration
- Recommended: GitHub Actions with Node.js setup
- Test on Node 16+ versions
- Include linting step in future CI pipeline

## PR instructions

### Pull Request Process
1. Fork the repository and create a feature branch (`feat/your-feature`)
2. Ensure code follows existing style and patterns
3. Update documentation if changes affect usage
4. Test locally with `npm link` before submitting

### Code Review Requirements
- Clear commit messages following conventional commits
- Changes should include relevant context or examples
- No breaking changes without version bump and changelog entry
- Maintain backward compatibility for CLI commands

### Versioning Strategy
- Semantic versioning (SemVer) via `package.json`
- Major version for breaking changes
- Minor version for new features
- Patch version for bug fixes

### Release Process
1. Update `version` in `package.json`
2. Run `npm test` (implement tests first)
3. Tag release: `git tag vX.Y.Z`
4. Publish: `npm publish --access public`
5. Update GitHub release notes

### Documentation Requirements
- Update README.md for user-facing changes
- Add examples for new features
- Document any new configuration options
- Maintain consistency in formatting and structure

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*