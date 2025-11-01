# Context Engine - Architecture Overview

Context Engine is built with a **modular, registry-based architecture** designed for infinite extensibility. Every major component can be extended without modifying core code.

## 📐 Architecture Principles

1. **Registry Pattern**: Central registries manage components dynamically
2. **Separation of Concerns**: Each module has a single, clear responsibility
3. **Plugin-First**: New features added as plugins, not core modifications
4. **Access Control**: Fine-grained permissions for security
5. **Backward Compatibility**: Old code continues to work as new features are added

## 🏗️ System Architecture

```
context-engine/
├── src/
│   ├── tools/              ⚙️ Tool System (FULLY MODULAR)
│   ├── sub-agents/         🤖 SubAgent System (FULLY MODULAR)
│   ├── providers/          🔌 AI Provider System (EXTENSIBLE)
│   ├── commands/           📋 CLI Commands
│   ├── config/             ⚙️ Configuration Management
│   ├── constants/          📝 Prompts & Patterns
│   ├── session/            💾 Session Management
│   ├── terminal/           🖥️ Terminal UI
│   ├── ui/                 🎨 UI Components
│   ├── utils/              🔧 Utilities
│   └── errors/             ❌ Error Handling
├── bin/
│   └── context.js          🚀 CLI Entry Point
└── scripts/
    └── postinstall.js      📦 Post-Install Setup
```

## 🎯 Modular Systems (Fully Extensible)

### 1. **Tool System** (`src/tools/`)

**What it does:** Manages all AI-callable functions with access control

**Modularity:**
- ✅ Registry-based tool management
- ✅ Access control: main, subagent, shared
- ✅ Add tools without modifying core
- ✅ Dynamic tool discovery

**How to extend:**
```javascript
// Add one tool definition in definitions.js
toolRegistry.register({
  name: 'myTool',
  availableTo: 'shared',
  handler: async (params, context) => { /* ... */ }
});
// Done! Available everywhere automatically
```

📖 **[Read more: src/tools/README.md](src/tools/README.md)**

### 2. **SubAgent System** (`src/sub-agents/`)

**What it does:** Manages concurrent AI agents for documentation generation

**Modularity:**
- ✅ Registry-based agent management
- ✅ Auto-registration via config export
- ✅ Concurrent execution support
- ✅ Scales to 10+ simultaneous agents

**How to extend:**
```javascript
// Create file in agents/ folder
export class MyAgent extends SubAgent { /* ... */ }
export const agentConfig = {
  name: 'MY_FILE.md',
  id: 'my-file',
  toolName: 'createMyFile',
  agentClass: MyAgent
};
// Register in index.js - Done!
```

📖 **[Read more: src/sub-agents/README.md](src/sub-agents/README.md)**

### 3. **Provider System** (`src/providers/`)

**What it does:** Manages AI model providers (XAI, OpenAI, etc.)

**Current state:** ⚠️ Partially modular (adding new providers requires code)

**Improvement needed:**
- [ ] Provider registry
- [ ] Auto-discovery of providers
- [ ] Plugin-based provider loading

📖 **[Read more: src/providers/README.md](src/providers/README.md)**

## 📂 Module Breakdown

### Core Systems

#### **commands/** - CLI Command Handlers
- `chat.js` - Main chat session logic
- `model.js` - Model selection
- `refine.js` - Prompt refinement

**Modularity:** ⚠️ Could be improved with command registry

#### **config/** - Configuration Management
- `config.js` - Uses `conf` library for persistent storage
- Stores API keys, user preferences

**Modularity:** ✅ Already uses external library

#### **constants/** - Static Content
- `models.js` - Available AI models
- `patterns.js` - Ignore patterns
- `prompts.js` - System prompts

**Modularity:** ⚠️ Could be improved with prompt templates system

#### **session/** - Session State
- `manager.js` - Session lifecycle
- `banner.js` - Welcome UI

**Modularity:** ✅ Well encapsulated

#### **terminal/** - Terminal Operations
- `screen.js` - Screen clearing
- `git.js` - Git repository detection

**Modularity:** ✅ Utility functions

#### **ui/** - User Interface
- `prompts.js` - User input
- `output.js` - Formatted output
- `autocomplete.js` - Command completion

**Modularity:** ✅ Component-based

#### **utils/** - Utilities
- `scanner.js` - Project file scanning
- `tokenizer.js` - Token counting
- `stream-writer.js` - Stream handling

**Modularity:** ✅ Pure utility functions

#### **errors/** - Error Handling
- `handler.js` - Centralized error handling
- `index.js` - Error exports

**Modularity:** ✅ Centralized

## 🔄 Data Flow

```
User Input
    ↓
CLI Entry (bin/context.js)
    ↓
Chat Session (commands/chat.js)
    ↓
├─→ AI Provider (providers/)
│       ↓
│   Tool Call?
│       ↓
│   ├─→ Main Tool (tools/registry.js)
│   └─→ SubAgent Tool (sub-agents/registry.js)
│           ↓
│       SubAgent Execution
│           ↓
│       SubAgent Tools (tools/registry.js)
│           ↓
│       File Creation
    ↓
AI Response
    ↓
User Output
```

## 🎨 Extension Points

### High Priority (Partially Modular)

1. **Provider System**
   - Current: Manual provider registration
   - Goal: Auto-discovery, plugin-based
   - Impact: Easy to add new AI providers

2. **Command System**
   - Current: Hardcoded commands
   - Goal: Command registry
   - Impact: Easy to add new CLI commands

3. **Prompt System**
   - Current: Static prompts in constants/
   - Goal: Template system with overrides
   - Impact: Customizable AI behavior

### Medium Priority

4. **Session Plugins**
   - Goal: Hooks for pre/post session actions
   - Impact: Custom session behavior

5. **Output Formatters**
   - Goal: Pluggable output formats (markdown, JSON, HTML)
   - Impact: Flexible output rendering

6. **Scanner Extensions**
   - Goal: Custom file scanners
   - Impact: Support for new project types

### Low Priority

7. **Custom UI Themes**
   - Goal: Customizable colors and styles
   - Impact: Personalization

8. **Analytics Plugins**
   - Goal: Usage tracking hooks
   - Impact: Insights and monitoring

## 🏗️ Adding a New Module Type

### Example: Custom Scanner

**1. Create Module Structure**
```
src/scanners/
├── core/
│   ├── base.js          # Base scanner class
│   └── registry.js      # Scanner registry
├── scanners/
│   ├── file-scanner.js  # Default file scanner
│   └── git-scanner.js   # Git history scanner
├── index.js             # Entry point
└── README.md            # Documentation
```

**2. Create Base Class**
```javascript
export class Scanner {
  async scan(directory) {
    throw new Error('Scanner subclasses must implement scan()');
  }
}
```

**3. Create Registry**
```javascript
class ScannerRegistry {
  register(config) { /* ... */ }
  getScanner(type) { /* ... */ }
}
export const scannerRegistry = new ScannerRegistry();
```

**4. Update Core to Use Registry**
```javascript
import { scannerRegistry } from './scanners/index.js';
const scanner = scannerRegistry.getScanner('file');
const results = await scanner.scan(directory);
```

## 🔐 Security Model

### Access Control Layers

1. **Tool Access Control**
   - Main AI: Read-only + system commands
   - Subagents: Read + Write (limited scope)

2. **File System Access**
   - Sandboxed to project directory
   - No system file access

3. **API Key Security**
   - Stored in OS keychain (via `conf`)
   - Never logged or exposed

4. **Subagent Isolation**
   - Limited tool access
   - No system control

## 📊 Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Subagents loaded on-demand
   - Tools loaded at startup (lightweight)

2. **Concurrent Execution**
   - Multiple subagents run in parallel
   - Tool calls batched when possible

3. **Token Management**
   - Efficient context building
   - Streaming responses

4. **Caching**
   - Configuration cached
   - Project scan results memoized

## 🧪 Testing Strategy

### Test Pyramid

```
    /\
   /  \     E2E Tests (Full workflows)
  /----\
 /      \   Integration Tests (Module interactions)
/--------\
/__________\  Unit Tests (Individual functions)
```

### Test Locations

- `tests/tools/` - Tool system tests
- `tests/sub-agents/` - SubAgent tests
- `tests/providers/` - Provider tests
- `tests/integration/` - Cross-module tests

## 📈 Scalability

### Current Limits

- **Subagents:** Tested up to 10 concurrent
- **Tools:** No practical limit
- **File Size:** Token-limited (model dependent)
- **Project Size:** Tested up to 5000 files

### Scaling Strategies

1. **Horizontal:** More concurrent subagents
2. **Vertical:** Better token management
3. **Distributed:** Future: Remote subagents

## 🔮 Future Architecture

### Planned Improvements

1. **Plugin System**
   ```
   plugins/
   ├── my-plugin/
   │   ├── tools/
   │   ├── agents/
   │   ├── providers/
   │   └── plugin.json
   ```

2. **Event System**
   ```javascript
   eventBus.on('session:start', handler);
   eventBus.on('agent:complete', handler);
   ```

3. **API Server Mode**
   ```javascript
   context serve --port 3000
   // RESTful API for remote access
   ```

4. **Marketplace**
   - Community-contributed plugins
   - Verified tools and agents
   - One-click installation

## 📚 Learning Path

### For New Contributors

1. Start: Read this document
2. Explore: `src/tools/README.md` and `src/sub-agents/README.md`
3. Try: Add a simple tool
4. Build: Create a custom subagent
5. Extend: Add a new provider
6. Contribute: Submit a PR!

### For Users

1. Install: `npm install -g @lukaloehr/context-engine`
2. Use: Basic chat and file analysis
3. Customize: Add tools for your workflow
4. Create: Custom agents for your docs
5. Share: Publish your extensions

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

Key principles:
- ✅ Follow existing patterns
- ✅ Add tests for new features
- ✅ Document public APIs
- ✅ Maintain backward compatibility
- ✅ Use registries, not hardcoded lists

---

*This document is maintained by the Context Engine team. Last updated: 2025-11-01*

