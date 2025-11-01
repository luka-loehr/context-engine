# context-engine AGENTS.md

Interactive AI-powered CLI tool that enables natural language conversations with codebases using XAI Grok models, providing context-aware answers and code analysis.

## Project Overview

context-engine is a terminal-based assistant that scans and understands entire codebases, allowing users to ask questions in natural language and receive intelligent, contextually relevant responses powered by XAI's Grok AI models. It supports multiple models for different use cases, features secure API key management, and provides beautifully formatted output with code highlighting.

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

### Starting the Application
```bash
cd your-project
context  # Starts interactive chat session
```

### Post-Installation
A postinstall script runs automatically to set up necessary configurations.

## Code style

- **Language and Module System**: Modern ES modules (ESM) with `"type": "module"` in package.json. Uses Node.js >=16.0.0.
- **Naming Conventions**: CamelCase for functions and variables, PascalCase for classes. Descriptive names following semantic patterns (e.g., `startApp`, `createUpdateNotifier`).
- **Import/Export Patterns**: Named exports for modularity (e.g., `export { startApp } from './core/index.js'`). Relative imports for internal modules, absolute for dependencies.
- **Code Organization Principles**: Modular structure with directories for concerns:
  - `src/commands/`: CLI command handlers
  - `src/config/`: Configuration and key management
  - `src/constants/`: Prompts, models, file patterns
  - `src/providers/`: XAI API integrations
  - `src/ui/`: Terminal UI and formatting components
  - `src/utils/`: Utilities like tokenizers and scanners
  Entry points in `bin/` and `src/index.js`.
- **Linting and Formatting**: No explicit linter specified; follow consistent indentation (2 spaces), JSDoc comments for documentation, and clean async/await patterns. Use chalk for colored output and highlight.js for code syntax.

## Dev environment tips

- **Common Development Commands**:
  - `npm link`: Link local package for testing in other projects.
  - `node bin/context.js`: Run the CLI directly.
  - Monitor updates with built-in notifier via `update-notifier`.
- **Build and Deployment**: No build step required; publish directly via npm. Global installation preferred (`preferGlobal: true`).
- **Environment Setup Requirements**: Ensure Node.js >=16. XAI API key must be set for functionality. Uses system keychain for secure storage via `conf` package.
- **Troubleshooting Tips**:
  - If API calls fail, verify `XAI_API_KEY` and network access.
  - For module resolution issues, confirm ESM support in Node version.
  - Clear config with `/clear` command in chat; reset keys via `/api`.
- **Performance Considerations**: Tool is lightweight with instant startup. Large codebases may increase scanning time; optimize by focusing on relevant directories. Token limits handled via `gpt-tokenizer`.

## Testing instructions

- **Test Commands**: Basic placeholder script exists (`npm test` echoes error and exits). Implement comprehensive tests for core functions like context loading, API integration, and UI rendering.
- **Test Structure and Organization**: No existing test suite. Organize tests in `__tests__/` or alongside source files using Jest or similar. Cover units for providers, utils, and commands.
- **CI/CD Setup**: Not configured. Recommend GitHub Actions for linting, unit tests, and npm publish on tags.
- **Testing Frameworks Used**: None specified. Suggest Vitest or Jest for ESM compatibility, with focus on async API mocks.
- **Coverage Requirements**: Aim for >80% coverage on core logic (scanning, prompting, response formatting). Test edge cases like large files and API errors.

## PR instructions

- **Pull Request Process**: Fork the repository, create feature branches (`feat/`, `fix/`, `docs/` prefixes). Ensure changes align with MIT license and project scope.
- **Code Review Requirements**: PRs must include descriptive titles and bodies explaining changes. Add JSDoc for new functions. No breaking changes without version bump. Test locally with `npm link`.
- **Versioning Strategy**: Semantic versioning (SemVer) via `package.json`. Major updates for API/model changes, minor for features, patch for fixes.
- **Release Process**: Update version with `npm version [major|minor|patch]`, commit, tag, and push. Publish to npm with `npm publish`. Update changelog in README if needed.
- **Documentation Requirements**: Update README.md for user-facing changes. Add examples for new features. Ensure code comments cover complex logic.

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*
