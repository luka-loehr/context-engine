# Context Engine AGENTS.md

Context Engine is a terminal-based AI assistant that enables natural language interaction with codebases using XAI's Grok models. It automatically loads project structure and provides contextually-aware responses for queries about code, architecture, and functionality.

## Project Overview

Context Engine (@lukaloehr/context-engine) is a CLI tool designed for developers to chat interactively with their codebase. Powered by XAI Grok models, it scans projects, tokenizes files, and delivers intelligent answers with formatted output including code highlighting. The tool supports multiple models for quick queries or deep analysis, with secure API key management and lightweight performance.

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
context  # Launches interactive chat
```

### Post-Install
The `postinstall` script runs automatically: `node scripts/postinstall.js`.

No tests are configured; the `test` script outputs an error message.

## Code style

- **Language and Module System**: Modern JavaScript (ES modules) with `"type": "module"` in package.json. Requires Node.js >=16.0.0.
- **Naming Conventions**: CamelCase for variables/functions, PascalCase for classes/components. Descriptive names emphasizing clarity (e.g., `loadProjectContext`, `renderResponse`).
- **Import/Export Patterns**: Named exports preferred (e.g., `export { handleChat } from './commands/chat.js'`). Relative imports for local modules; absolute for dependencies. Avoid default exports unless necessary.
- **Code Organization Principles**: Modular structure with directories for concerns:
  - `src/commands/`: CLI command handlers.
  - `src/config/`: Configuration and key management.
  - `src/constants/`: Prompts, models, file patterns.
  - `src/providers/`: API integrations (XAI/OpenAI compatible).
  - `src/ui/`: Terminal rendering and formatting.
  - `src/utils/`: Helpers like tokenization, scanning, file processing.
  Follow single responsibility: Keep functions focused, under 50 lines where possible.
- **Linting and Formatting Tools**: No explicit linter/formatter in package.json (e.g., no ESLint/Prettier). Use consistent indentation (2 spaces), semicolons, and avoid trailing commas for compatibility. Adhere to Node.js best practices for async/await over callbacks.

## Dev environment tips

- **Common Development Commands**:
  - `npm link`: Symlink for testing changes locally in other projects.
  - `node bin/context.js`: Run the CLI directly for debugging.
  - `npm run postinstall`: Manually trigger post-install script if needed.

- **Build and Deployment Processes**: No build step required (pure JS). For publishing: Update version in package.json, `npm publish`. Global installs via `npm install -g`. Use `update-notifier` for version checks.

- **Environment Setup Requirements**: Node.js >=16. Ensure `XAI_API_KEY` is set. The tool uses `conf` for secure storage in system keychain. For development, test with mock API responses in `providers/` to avoid rate limits.

- **Troubleshooting Tips**:
  - If context loading fails, check file patterns in `constants/` and ensure no infinite loops in scanners.
  - API errors: Verify key with `/api` command; fallback to OpenAI if using `openai` dependency.
  - Terminal issues: Dependencies like `chalk`, `ora`, and `highlight.js` handle colors/spinners; test in different terminals.
  - Token limits: Use `gpt-tokenizer` to monitor; avoid loading entire large repos.

- **Performance Considerations**: Scans are file-based; limit to relevant extensions (JS/TS/MD/etc.) via constants. Asynchronous loading prevents blocking. For large projects, consider caching mechanisms in future iterations.

## Testing instructions

- **Test Commands**: No tests implemented. The `npm test` script echoes an error: "Error: no test specified" and exits 1. Add tests manually using a framework like Jest or Tap.

- **Test Structure and Organization**: Currently absent. Recommend organizing tests in a `tests/` directory mirroring `src/`. Unit tests for utils (e.g., tokenization), integration tests for API providers and CLI commands.

- **CI/CD Setup**: Not configured in package.json. For GitHub Actions, add a workflow for linting, testing on push/PR. No coverage tools specified.

- **Testing Frameworks Used**: None. Suggest Jest for JS modules, with focus on async flows in providers and UI rendering.

- **Coverage Requirements**: None defined. Aim for >80% coverage on core logic (scanning, prompting, rendering) once implemented.

## PR instructions

- **Pull Request Process**: Fork the repo, create a feature branch (e.g., `feat/new-command`), commit with clear messages (e.g., "Add model switching command"). Open PR against `main` branch on GitHub.

- **Code Review Requirements**: Ensure changes follow code style (modular, documented). Add tests for new features. Update README.md for user-facing changes. No conflicts with existing dependencies.

- **Versioning Strategy**: Semantic versioning (SemVer) via package.json (current: 4.0.0). Major for breaking changes (e.g., API updates), minor for features, patch for fixes.

- **Release Process**: Update version, changelog in README if significant. `npm publish` for npm releases. Tag releases on GitHub. Notify via issues or XAI community if model integrations change.

- **Documentation Requirements**: Update README.md for new features/commands. Add inline JSDoc comments for complex functions. Ensure examples in docs match current behavior.

---

*Generated by [context-engine](https://github.com/luka-loehr/context-engine)*