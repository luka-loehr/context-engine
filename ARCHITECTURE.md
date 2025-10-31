# promptx Architecture Documentation

## Overview

promptx v4.0.0 represents a complete architectural overhaul, transforming a 1500+ line monolithic application into a modular, maintainable system built on solid software engineering principles.

## Design Philosophy

The new architecture follows these key principles:

### 1. **Separation of Concerns**
Each module has a single, well-defined responsibility:
- Commands handle user interactions
- Providers manage AI API integrations
- UI modules handle display and input
- Utils provide reusable helper functions
- Config manages application state

### 2. **Provider Pattern**
All AI providers implement a common `BaseProvider` interface:
```javascript
class BaseProvider {
  async refinePrompt(messyPrompt, systemPrompt, onChunk) {
    // Provider-specific implementation
  }
}
```

This makes it trivial to add new AI providers without modifying existing code.

### 3. **Dependency Injection**
Configuration and dependencies are passed explicitly rather than being globally accessed:
```javascript
// Before: Global config access scattered throughout
const config = getGlobalConfig();

// After: Explicit dependency injection
async function setupWizard(config) { /* ... */ }
```

### 4. **Pure Functions**
Where possible, functions are pure (same input → same output, no side effects):
```javascript
// Pure utility function
export function getTotalCharacterCount(files) {
  return files.reduce((sum, f) => sum + f.content.length, 0);
}
```

### 5. **Testability**
Small, focused modules with explicit dependencies are easy to unit test:
```javascript
// Easy to test - no dependencies on external state
import { validateOpenAIKey } from './validation.js';
expect(validateOpenAIKey('sk-123')).toBe(true);
```

## Module Structure

```
promptx-cli/
├── bin/
│   └── promptx.js          # Entry point (minimal)
├── src/
│   ├── commands/           # Command handlers
│   │   ├── help.js        # Help display
│   │   ├── model.js       # Model switching
│   │   ├── refine.js      # Prompt refinement
│   │   ├── setup.js       # Setup wizard
│   │   └── whats-new.js   # Release notes
│   │
│   ├── config/            # Configuration
│   │   └── config.js      # Config management
│   │
│   ├── constants/         # Static data
│   │   ├── models.js      # Model definitions
│   │   ├── patterns.js    # File patterns
│   │   └── prompts.js     # System prompts
│   │
│   ├── providers/         # AI integrations
│   │   ├── base.js        # Base class
│   │   ├── xai.js         # Grok
│   │   └── index.js       # Factory
│   │
│   ├── ui/                # User interface
│   │   ├── output.js      # Display formatting
│   │   └── prompts.js     # User input
│   │
│   ├── utils/             # Utilities
│   │   ├── ollama.js      # Ollama helpers
│   │   ├── scanner.js     # File scanning
│   │   ├── stream-writer.js # Streaming output
│   │   └── validation.js  # Input validation
│   │
│   └── index.js           # Main orchestrator
│
├── scripts/
│   └── postinstall.js     # NPM postinstall
│
├── package.json
├── README.md
├── CHANGELOG.md
└── ARCHITECTURE.md        # This file
```

## Data Flow

### 1. Application Startup
```
bin/promptx.js
  → src/index.js (main())
    → Check for updates
    → Parse CLI arguments
    → Route to appropriate command
```

### 2. Setup Flow
```
User runs: promptx
  → getOrSetupConfig()
    → setupWizard()
      → promptForProvider()
      → promptForModel()
      → promptForAPIKey()
      → Save to config
```

### 3. Prompt Refinement Flow
```
User enters prompt
  → getOrSetupConfig()
  → getProjectContext() [if --pro]
  → refinePrompt()
    → createProvider()
    → provider.refinePrompt()
      → Stream chunks to UI
    → displayRefinedPrompt()
```

## Adding New Features

### Adding a New AI Provider

1. **Create Provider Class** (`src/providers/newprovider.js`):
```javascript
import { BaseProvider } from './base.js';

export class NewProvider extends BaseProvider {
  constructor(apiKey, modelId) {
    super(apiKey);
    this.modelId = modelId;
  }

  async refinePrompt(messyPrompt, systemPrompt, onChunk) {
    // Implementation
  }
}
```

2. **Register in Factory** (`src/providers/index.js`):
```javascript
import { NewProvider } from './newprovider.js';

export function createProvider(provider, apiKey, modelId) {
  switch (provider) {
    case 'newprovider':
      return new NewProvider(apiKey, modelId);
    // ...
  }
}
```

3. **Add Model Definitions** (`src/constants/models.js`):
```javascript
export const MODELS = {
  newprovider: {
    'model-name': { name: 'Model Name', provider: 'newprovider' }
  }
};
```

4. **Add Validation** (`src/utils/validation.js`):
```javascript
export function validateNewProviderKey(input) {
  // Validation logic
}
```

### Adding a New Command

1. **Create Command Module** (`src/commands/mycommand.js`):
```javascript
import chalk from 'chalk';

export function myCommand() {
  console.log(chalk.blue('Command output'));
}
```

2. **Register in Main** (`src/index.js`):
```javascript
import { myCommand } from './commands/mycommand.js';

// In action handler:
if (command === '/mycommand') {
  myCommand();
  return;
}
```

3. **Update Help** (`src/commands/help.js`):
```javascript
console.log(chalk.white('  /mycommand  ') + chalk.gray('- Description'));
```

## Benefits of New Architecture

### Before (Monolithic)
- ❌ 1500+ lines in single file
- ❌ Global state scattered throughout
- ❌ Difficult to test
- ❌ Hard to add new providers
- ❌ Coupling between concerns
- ❌ Poor code reusability

### After (Modular)
- ✅ Small, focused modules (~50-200 lines each)
- ✅ Explicit dependency management
- ✅ Easy to unit test
- ✅ Provider pattern for easy extension
- ✅ Clear separation of concerns
- ✅ Reusable components

## Performance

The refactoring maintains identical runtime performance while improving:
- **Development velocity**: Easier to find and modify code
- **Debugging**: Smaller modules are easier to debug
- **Onboarding**: New contributors can understand the system faster

## Backward Compatibility

The refactoring maintains **100% backward compatibility**:
- All CLI commands work identically
- Configuration format unchanged
- API keys and settings preserved
- No migration required

## Future Improvements

The new architecture enables:
1. **Unit Testing**: Add comprehensive test suite
2. **TypeScript Migration**: Type-safe codebase
3. **Plugin System**: Community-contributed providers
4. **CI/CD**: Automated testing and deployment
5. **Documentation**: Auto-generated API docs

## Conclusion

The v4.0.0 refactoring transforms promptx from a functional prototype into a production-ready, maintainable application. The modular architecture sets the foundation for continued growth and community contributions.

