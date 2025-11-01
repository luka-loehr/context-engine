# context-engine AGENTS.md

This document provides instructions for AI coding agents working on the **context-engine** project.

## Project Overview

**context-engine** is a terminal-based CLI tool that enables developers to chat with their entire codebase using natural language. Powered by XAI's Grok models, it automatically scans project files, loads relevant context, and provides intelligent, contextually-aware answers to questions about the code.

**Main Purpose:**
- Allow developers to ask questions like "What does this project do?", "Show me the authentication flow", or "Explain this function" and get instant, accurate responses based on actual file contents.
- Support multiple AI models (fast vs. reasoning) for different use cases.
- Provide a seamless, interactive chat experience in the terminal with beautiful formatting and code highlighting.

**Key Features:**
- Smart project scanning and context loading
- Interactive chat with conversation history
- Tool integration for dynamic file loading during conversations
- Secure API key management using system keychain
- Beautiful terminal output with syntax highlighting
- Model switching and configuration management

The project is written in modern ES modules (Node.js) and uses a modular architecture for maintainability.

## Setup commands

### Prerequisites
- Node.js >= 16.0.0
- npm or yarn package manager
- Git for cloning the repository

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/luka-loehr/context-engine.git
   cd context-engine
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Link for local development/testing:**
   ```bash
   npm link
   ```
   This makes the `context` command available globally for testing.

4. **Set up XAI API key:**
   Create a `.env` file in the project root:
   ```env
   XAI_API_KEY=your_xai_api_key_here
   ```
   Or set it as an environment variable:
   ```bash
   export XAI_API_KEY="your_xai_api_key_here"
   ```

### Development Server

There is no traditional development server. The project is a CLI tool. To test:

1. **Run the main CLI:**
   ```bash
   node bin/context.js
   ```
   Or use the linked command:
   ```bash
   context
   ```

2. **Test in a sample project:**
   - Navigate to any project directory (e.g., `cd ../my-other-project`)
   - Run `context` to start the chat session
   - The tool will scan the current directory's files automatically

### Running Tests

Currently, no test suite is implemented. The `package.json` shows:
```bash
npm test
```
This outputs an error message indicating no tests are specified.

**Future agents should add:**
- Unit tests for core functions (prompt building, file scanning, API calls)
- Integration tests for chat sessions
- Test framework: Jest or similar

### Other Setup Steps

1. **Post-install script:** Runs automatically on `npm install`. Warns if not installed globally.
2. **Global installation for production use:**
   ```bash
   npm install -g @lukaloehr/context-engine
   ```
3. **Configuration initialization:** First run creates config files using the `conf` package (stored in user's home directory).

## Code style

### Language and Module System
- **JavaScript (ES Modules)**: Uses `import/export` syntax (`"type": "module"` in package.json)
- **Node.js runtime**: Targeted for Node.js >= 16.0.0
- **No TypeScript**: Pure JavaScript with JSDoc comments for documentation

### Naming Conventions
- **Files**: Kebab-case (e.g., `chat.js`, `xai-provider.js`)
- **Functions**: camelCase (e.g., `startChatSession`, `getSystemPrompt`)
- **Variables/Constants**: camelCase for variables, UPPER_SNAKE_CASE for true constants (e.g., `SYSTEM_PROMPT`)
- **Classes**: PascalCase (e.g., `XAIProvider`, `BaseProvider`)
- **Modules**: Descriptive names reflecting purpose (e.g., `src/providers/xai.js`)

### Import/Export Patterns
- **Named exports**: Preferred for utilities and functions (e.g., `export { startChatSession }`)
- **Default exports**: Used sparingly, mainly for main entry points (e.g., `export default config`)
- **Relative imports**: Use relative paths (e.g., `import { getSystemPrompt } from '../constants/prompts.js'`)
- **No deep nesting**: Imports are organized by feature (commands, providers, utils)
- **Avoid circular imports**: Structure ensures one-way dependencies (e.g., commands import utils, not vice versa)

### Code Organization Principles
- **Modular architecture**: Clear separation of concerns
  - `src/commands/`: CLI commands and chat logic
  - `src/config/`: Configuration management
  - `src/constants/`: Prompts, models, patterns
  - `src/providers/`: API integrations (XAI)
  - `src/ui/`: Terminal output and prompts
  - `src/utils/`: Helper functions (tokenizers, tools)
  - `src/session/`: Conversation state management
  - `src/errors/`: Error handling
- **Single responsibility**: Each file/module handles one core function
- **Entry points**: `bin/context.js` (CLI), `src/index.js` (main logic)
- **Async/await**: Consistent use for all I/O operations (file reading, API calls)

### Linting and Formatting
- **No explicit linter configured**: Project uses clean, readable code without ESLint/Prettier setup
- **Manual conventions**:
  - 2-space indentation
  - Single quotes for strings
  - Semicolons required
  - Line length: ~100 characters
- **Future recommendation**: Add ESLint with Airbnb style guide and Prettier for auto-formatting
- **JSDoc comments**: Used for functions and classes (e.g., `@param`, `@returns`)

**When contributing code:**
- Follow existing patterns: async functions, chalk for coloring, ora for spinners
- Keep functions under 100 lines
- Use descriptive variable names
- Add JSDoc for public APIs

## Dev environment tips

### Common Development Commands

- **Start development session:**
  ```bash
  npm link  # If not already linked
  context   # Run in current or target project dir
  ```

- **Debug with logging:**
  Add `console.log` statements in `src/commands/chat.js` or `src/providers/xai.js`
  Run with `node --inspect bin/context.js` for Chrome DevTools debugging

- **Check token usage:**
  The project uses `gpt-tokenizer` for estimating tokens. Monitor in `src/utils/tokenizer.js`

- **Test API calls:**
  Set `XAI_API_KEY` and run isolated provider tests:
  ```bash
  node -e "import('./src/providers/xai.js').then(m => new m.XAIProvider(process.env.XAI_API_KEY, 'grok-4-fast-non-reasoning').refinePrompt('Hello', '', console.log))"
  ```

- **Scan project files manually:**
  The file scanner is in `src/utils/scanner.js` (inferred from usage). Test loading context.

### Build and Deployment Processes

- **No build step**: Pure JS, no transpilation needed
- **Production deployment**: Publish to npm
  1. Update version in `package.json`
  2. `npm publish --access public`
  3. Global install: `npm install -g @lukaloehr/context-engine`

- **Versioning**: Semantic versioning (current: 4.0.0)
- **Postinstall**: `scripts/postinstall.js` runs on install to warn about global usage

### Environment Setup Requirements

- **Required env vars:** `XAI_API_KEY` for API calls
- **Config storage**: Uses `conf` package – stores in `~/.config/context-engine` (JSON)
- **Dependencies**: All listed in `package.json`. No devDependencies.
- **Global vs local**: For dev, use `npm link`; for prod, global install

### Troubleshooting Tips

- **API Key Issues:**
  - Check `XAI_API_KEY` env var or config
  - Use `/api` command in chat to import from `.env`
  - Error: "Missing API key" → Set env var or run setup

- **File Scanning Problems:**
  - Tool scans current working directory (CWD)
  - Ignores `node_modules`, `.git`, etc. (standard gitignore patterns)
  - Large projects: May hit token limits – monitor with `formatTokenCount`

- **Streaming Issues:**
  - Uses OpenAI-compatible streaming via XAI API
  - If chunks don't appear: Check network, API rate limits
  - Tool calls: Handled in loop until no more tools needed

- **Model Switching:**
  - Default: 'context' (grok-4-fast-non-reasoning)
  - Ultra: 'context-ultra' (grok-4-fast-reasoning)
  - Use `/model` in chat or set `selected_model` in config

- **Performance Considerations:**
  - Token limits: Grok models support up to 100k tokens
  - File loading: Lazy-load via tools during chat to avoid initial overload
  - Spinners: Use `ora` for UX, but don't overuse in hot paths
  - Memory: Session history grows – implement pruning if needed

**Gotchas:**
- ES modules require `.js` extensions in imports
- XAI API uses OpenAI SDK with custom baseURL
- Tool calls must return JSON.stringify results
- No tests: Add before major changes

## Testing instructions

### Current Testing Status

The project currently has **no automated tests**. The `package.json` script is:
```bash
npm test
```
This outputs an error message indicating no tests are specified.

### Recommended Testing Setup

**Testing Frameworks:**
- **Unit Testing**: Jest (for functions, utils)
- **Integration Testing**: For chat sessions and API flows
- **E2E Testing**: Puppeteer or similar for CLI interaction (advanced)

**Test Structure:**
```
tests/
├── unit/
│   ├── providers.test.js
│   ├── utils.test.js
│   └── prompts.test.js
├── integration/
│   └── chat-session.test.js
└── fixtures/
    └── sample-project/  # Mock projects for testing
```

### Test Commands (Future)

```bash
# Install test deps
npm install --save-dev jest @jest/globals

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Testing Best Practices

1. **Mock External Dependencies:**
   - Mock XAI API calls using `nock` or Jest mocks
   - Mock file system with `memfs` for scanner tests
   - Mock `inquirer` and `ora` for UI tests

2. **Key Areas to Test:**
   - **Prompt Building**: `src/constants/prompts.js` – Ensure formatting rules are followed
   - **API Integration**: `src/providers/xai.js` – Tool calls, streaming, error handling
   - **Chat Logic**: `src/commands/chat.js` – Session management, command handling
   - **Utils**: Token counting, file scanning, stream writing
   - **Edge Cases**: Empty projects, missing API keys, large files

3. **Coverage Requirements:**
   - Aim for 80%+ coverage on core logic (providers, commands, utils)
   - 100% on critical paths (API calls, tool execution)
   - Document test strategy in a `TESTING.md` file

### CI/CD Setup

**Recommended:** GitHub Actions

Example `.github/workflows/test.yml`:
```yaml
name: Test
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
    - run: npm run build  # If added
```

**Coverage Reporting:**
- Use `jest --coverage` and upload to Codecov or similar
- Require PRs to maintain >80% coverage

## PR instructions

### Pull Request Process

1. **Fork and Clone:**
   - Fork the repository on GitHub
   - Clone your fork: `git clone https://github.com/your-username/context-engine.git`
   - Add upstream: `git remote add upstream https://github.com/luka-loehr/context-engine.git`

2. **Branching:**
   - Create feature branches: `git checkout -b feature/add-tests`
   - Keep branches small and focused (one feature/fix per PR)
   - Use descriptive names: `fix/api-error-handling`, `feat/model-switching`

3. **Development Workflow:**
   - Make changes following code style guidelines
   - Test locally: `npm link && context` in a test project
   - Commit with clear messages: `git commit -m "feat: add jest test suite"`
   - Push: `git push origin feature/add-tests`

4. **Create PR:**
   - Open PR against `main` branch
   - Use template: Describe problem, solution, changes
   - Link to issues: `Fixes #123`
   - Add labels: `enhancement`, `bug`, `tests`

### Code Review Requirements

- **Automated Checks:**
  - No linting errors (add ESLint if implemented)
  - Tests pass (add if implementing)
  - No breaking changes to CLI interface

- **Manual Review:**
  - Follows existing code patterns and style
  - Proper error handling for async operations
  - No console.logs in production code
  - JSDoc comments for new public functions
  - Security: No hard-coded API keys or secrets

- **Reviewer Checklist:**
  - [ ] Code is readable and well-documented
  - [ ] Tests added/updated for changes
  - [ ] No performance regressions (check token usage)
  - [ ] CLI output is properly formatted
  - [ ] Error messages are user-friendly

**Review Process:**
- Author: Self-review first
- Maintainer: Review within 48 hours
- Changes: Address feedback in new commits
- Merge: After approval, no conflicts

### Versioning Strategy

- **Semantic Versioning (SemVer):** MAJOR.MINOR.PATCH
  - **MAJOR** (4.0.0 → 5.0.0): Breaking changes (e.g., new CLI args, model changes)
  - **MINOR** (4.0.0 → 4.1.0): New features (e.g., new model support, tools)
  - **PATCH** (4.0.0 → 4.0.1): Bug fixes, docs

- **Pre-releases:** Use `-alpha`, `-beta` for testing (e.g., `4.1.0-alpha.1`)
- **Changelog:** Update `CHANGELOG.md` with each release
- **Commitizen:** Consider adding for standardized commits

### Release Process

1. **Prepare Release:**
   ```bash
   git checkout main
   git pull upstream main
   npm version patch  # or minor/major
   ```

2. **Update Files:**
   - `package.json`: Version updated automatically
   - `README.md`: Add new features
   - `CHANGELOG.md`: Document changes

3. **Test Release:**
   ```bash
   npm pack  # Create tarball
   npm install ./context-engine-4.0.1.tgz  # Test install
   ```

4. **Publish:**
   ```bash
   npm publish --access public
   git push upstream main
   git push upstream --tags
   ```

5. **Post-Release:**
   - Update GitHub release
   - Announce on social media/issues
   - Monitor for issues

**Maintainer Only:** Publishing requires npm ownership.

### Documentation Requirements

- **Inline Docs:** JSDoc for all public functions/classes
- **README Updates:** Any CLI changes, new features, installation steps
- **AGENTS.md:** Update this file for dev process changes
- **New Features:** Add examples in README
- **API Changes:** Document in code comments

**When to Update Docs:**
- Every PR that changes user-facing behavior
- New commands or models
- Setup or configuration changes
- Before merging to main
