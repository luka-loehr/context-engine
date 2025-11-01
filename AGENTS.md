# context-engine AGENTS.md

context-engine is a terminal-based AI assistant that enables natural language interaction with codebases, powered by XAI's Grok models. It provides context-aware answers, code analysis, and project insights through an interactive CLI interface.

## Project Overview

context-engine scans and loads project structures to facilitate intelligent conversations about code. It supports multiple AI models for quick responses or deep analysis, with features like secure API key management, syntax-highlighted output, and efficient codebase tokenization. The tool is designed for developers to query project architecture, debug issues, and understand complex implementations without manual navigation.

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
Or create `.env`:
```
XAI_API_KEY=xai-your_api_key_here
```

### Starting the Tool
```bash
cd your-project
context
```

### Post-Installation
The `postinstall` script runs automatically: `node scripts/postinstall.js`.

No tests are configured; run `npm test` echoes an error message.

## Code style

- **Language and Module System**: Modern JavaScript (ES modules) with `"type": "module"` in package.json. Requires Node.js >=16.0.0.
- **Naming Conventions**: Kebab-case for files and directories (e.g., `context-engine`, `postinstall.js`). PascalCase for classes/components. camelCase for variables and functions.
- **Import/Export Patterns**: Use named exports/imports (e.g., `import { something } from './module.js'`). Relative paths for local modules (e.g., `../utils/scanner`).
- **Code Organization Principles**: Modular structure with dedicated directories:
  - `src/commands/`: CLI command handlers.
  - `src/config/`: Configuration and key management.
  - `src/constants/`: Prompts, models, and patterns.
  - `src/providers/`: API integrations (XAI/OpenAI).
  - `src/ui/`: Terminal rendering and formatting.
  - `src/utils/`: Utilities like tokenizers and scanners.
  Follow single-responsibility principle; keep functions concise (<50 lines where possible).
- **Linting and Formatting Tools**: No explicit linter/formatter in package.json (e.g., no ESLint/Prettier). Use consistent indentation (2 spaces) and follow Node.js conventions. Validate with `node --check` for syntax.

## Dev environment tips

- **Common Development Commands**:
  - Link for testing: `npm link`.
  - Run CLI directly: `node bin/context.js`.
  - Check updates: The tool uses `update-notifier` for version checks.
- **Build and Deployment Processes**: No build step required (pure JS). For publishing: Update version in package.json, then `npm publish`. Global installs via `npm install -g`.
- **Environment Setup Requirements**: Node.js >=16. Ensure `XAI_API_KEY` is set for testing API features. Use `.env` for local dev; keys stored via `conf` package in system keychain.
- **Troubleshooting Tips**:
  - API errors: Verify key with `/api` command or env var.
  - Module resolution: Use absolute paths sparingly; prefer relatives.
  - Token limits: Monitor with `gpt-tokenizer`; avoid loading large repos without filtering.
  - If `ora` spinner fails, check terminal compatibility (supports most modern terminals).
- **Performance Considerations**: Tool is lightweight; scans files efficiently. For large codebases, limit file types via constants. Use fast model (`context`) for quick iterations.

## Testing instructions

- **Test Commands**: No tests implemented. Running `npm test` outputs: "Error: no test specified" and exits with code 1.
- **Test Structure and Organization**: Tests would ideally go in a `tests/` or `__tests__/` directory, using a framework like Jest or Mocha. Structure: unit tests for utils/providers, integration tests for CLI flows.
- **CI/CD Setup**: Not configured in package.json. Recommend GitHub Actions for linting, basic smoke tests on install/run, and API mock tests.
- **Testing Frameworks Used**: None currently. For future: Jest for unit/integration; `supertest` for any server-like components (though this is CLI-focused).
- **Coverage Requirements**: None specified. Aim for >80% on utils and providers in future implementations. Mock API calls to avoid real XAI requests during tests.

## PR instructions

- **Pull Request Process**: Fork the repo, create feature branch (e.g., `feat/new-command`), implement changes, then submit PR to `main`. Use descriptive titles (e.g., "Add ESLint configuration").
- **Code Review Requirements**: Ensure no breaking changes to CLI interface. Add tests for new features. Update README.md for user-facing changes. Reviewers check for security (e.g., key handling), performance (token usage), and style consistency.
- **Versioning Strategy**: Semantic versioning (SemVer) via package.json. Patch for bug fixes, minor for features, major for breaking changes (e.g., model updates).
- **Release Process**: Update version, changelog in README if significant, then `npm publish`. Tag releases on GitHub. Notify via issues or Twitter for major versions.
- **Documentation Requirements**: Update README.md for new commands/models. Add examples in usage section. For internal changes, document in code comments. Ensure AGENTS.md reflects dev updates.

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*