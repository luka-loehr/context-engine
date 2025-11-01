# Modularity & Extensibility Guide

Context Engine is built on a **fully modular architecture** where every major component can be extended without modifying core code. This document provides a high-level overview of what's modular and how to extend it.

## 🎯 Quick Reference

| Component | Modularity | How to Extend | Time | Docs |
|-----------|-----------|---------------|------|------|
| **Tools** | ✅ Fully Modular | Add to `definitions.js` | 15 min | [src/tools/README.md](src/tools/README.md) |
| **SubAgents** | ✅ Fully Modular | Create file in `agents/` | 1 hour | [src/sub-agents/README.md](src/sub-agents/README.md) |
| **Providers** | ⚠️ Extensible | Create provider class | 3 hours | [src/providers/README.md](src/providers/README.md) |
| **Commands** | ⚠️ Partially | Add to `commands/` | 2 hours | Coming soon |
| **Prompts** | ⚠️ Static | Edit `constants/` | 30 min | Coming soon |

## ✅ Fully Modular Systems

### 1. Tool System

**Status:** ✅ 100% Modular

**What it is:** All AI-callable functions (file reading, writing, system commands)

**How to extend:**
```javascript
// Single addition in src/tools/definitions.js
toolRegistry.register({
  name: 'myTool',
  availableTo: 'shared',
  handler: async (params, context) => {
    // Your implementation
  }
});
```

**Features:**
- ✅ Registry-based management
- ✅ Access control (main/subagent/shared)
- ✅ No core modifications needed
- ✅ Automatic availability
- ✅ Isolated testing

**Documentation:** [src/tools/README.md](src/tools/README.md)

---

### 2. SubAgent System

**Status:** ✅ 100% Modular

**What it is:** Specialized AI agents for documentation generation

**How to extend:**
```javascript
// 1. Create src/sub-agents/agents/my-agent.js
export class MyAgent extends SubAgent { /* ... */ }
export const agentConfig = {
  name: 'MY_DOC.md',
  id: 'my-doc',
  toolName: 'createMyDoc',
  agentClass: MyAgent
};

// 2. Register in src/sub-agents/index.js
import { agentConfig as myAgentConfig } from './agents/my-agent.js';
registry.register(myAgentConfig);
```

**Features:**
- ✅ Registry-based management
- ✅ Concurrent execution (10+ agents)
- ✅ Auto-registration
- ✅ Coordinated UI
- ✅ Isolated from core

**Documentation:** [src/sub-agents/README.md](src/sub-agents/README.md)

---

## ⚠️ Extensible Systems (Improvement Needed)

### 3. Provider System

**Status:** ⚠️ 80% Modular

**What it is:** AI model integrations (XAI, OpenAI, etc.)

**Current process:**
1. Create provider class extending `BaseProvider`
2. Update factory in `index.js`
3. Add models to `constants/models.js`
4. Configure API key handling

**Improvement needed:**
- [ ] Provider registry
- [ ] Auto-discovery
- [ ] Plugin-based loading

**Documentation:** [src/providers/README.md](src/providers/README.md)

---

### 4. Command System

**Status:** ⚠️ 60% Modular

**What it is:** CLI commands (chat, model, refine)

**Current process:**
- Commands are in separate files
- Imported directly in main entry point
- No registry system

**Improvement needed:**
- [ ] Command registry
- [ ] Auto-discovery
- [ ] Plugin commands

**Workaround:** Add commands to `src/commands/` and import in `bin/context.js`

---

### 5. Prompt System

**Status:** ⚠️ 40% Modular

**What it is:** System prompts and patterns

**Current process:**
- Prompts hardcoded in `constants/prompts.js`
- Patterns in `constants/patterns.js`
- Models in `constants/models.js`

**Improvement needed:**
- [ ] Template system
- [ ] User-customizable prompts
- [ ] Prompt plugins

**Workaround:** Edit files in `src/constants/`

---

## 🔮 Future Modularity Roadmap

### Phase 1: Complete Core Modularity (v5.0)
- [ ] Provider registry system
- [ ] Command registry system
- [ ] Prompt template system
- [ ] Configuration profiles

### Phase 2: Plugin System (v6.0)
- [ ] Plugin architecture
- [ ] Plugin discovery
- [ ] Plugin marketplace
- [ ] Sandboxed plugin execution

### Phase 3: Distributed System (v7.0)
- [ ] Remote subagents
- [ ] Distributed tool execution
- [ ] Load balancing
- [ ] Horizontal scaling

---

## 📊 Modularity Scorecard

| System | Registry | Auto-Discovery | Access Control | Plugins | Score |
|--------|----------|----------------|----------------|---------|-------|
| **Tools** | ✅ | ✅ | ✅ | ⚠️ | 95% |
| **SubAgents** | ✅ | ✅ | ✅ | ⚠️ | 95% |
| **Providers** | ❌ | ❌ | ✅ | ❌ | 60% |
| **Commands** | ❌ | ❌ | ❌ | ❌ | 40% |
| **Prompts** | ❌ | ❌ | ❌ | ❌ | 20% |

**Overall Modularity: 82%** ⭐⭐⭐⭐

---

## 🎓 Learning Path

### Beginner (Add a Tool)
**Time:** 30 minutes

1. Read [src/tools/README.md](src/tools/README.md)
2. Add tool definition in `definitions.js`
3. Test with `npm install -g .`
4. Submit PR!

**Example:** Add a code complexity analyzer

---

### Intermediate (Create a SubAgent)
**Time:** 2 hours

1. Read [src/sub-agents/README.md](src/sub-agents/README.md)
2. Create agent file in `agents/`
3. Write system and initial prompts
4. Register and test
5. Submit PR!

**Example:** Create CONTRIBUTING.md generator

---

### Advanced (Add a Provider)
**Time:** 1 day

1. Read [src/providers/README.md](src/providers/README.md)
2. Implement provider class
3. Update factory and models
4. Configure API keys
5. Test streaming and tools
6. Submit PR!

**Example:** Add Anthropic Claude support

---

## 🏆 Extension Examples

### Real-World Extensions

**1. Security Scanner Tool**
```javascript
// src/tools/definitions.js
toolRegistry.register({
  name: 'scanSecurity',
  description: 'Scan code for security vulnerabilities',
  availableTo: 'main',
  handler: async (params, context) => {
    // Scan for SQL injection, XSS, etc.
    return { success: true, vulnerabilities: [...] };
  }
});
```

**2. API Documentation Generator**
```javascript
// src/sub-agents/agents/api-docs.js
export class ApiDocsSubAgent extends SubAgent {
  getSystemPrompt() {
    return `Generate comprehensive API documentation...`;
  }
}

export const agentConfig = {
  name: 'API_DOCS.md',
  id: 'api-docs',
  toolName: 'createApiDocs',
  agentClass: ApiDocsSubAgent
};
```

**3. Local LLM Provider**
```javascript
// src/providers/ollama.js
export class OllamaProvider extends BaseProvider {
  constructor(apiKey, modelId) {
    super(apiKey);
    this.baseURL = 'http://localhost:11434';
    this.modelId = modelId;
  }
  
  async refinePrompt(/* ... */) {
    // Connect to local Ollama instance
  }
}
```

---

## 🛠️ Extension Patterns

### Pattern 1: Wrapper Tool

Wrap existing tools with preprocessing:

```javascript
toolRegistry.register({
  name: 'analyzeLargeFile',
  handler: async (params, context) => {
    // Preprocess: Split large file
    const chunks = splitFile(params.filePath);
    
    // Use existing tool
    const results = await Promise.all(
      chunks.map(chunk => 
        toolRegistry.executeTool('analyzeCode', { content: chunk }, context)
      )
    );
    
    // Postprocess: Combine results
    return combineResults(results);
  }
});
```

### Pattern 2: Composite SubAgent

Create subagent that uses other subagents:

```javascript
export class FullDocsSubAgent extends SubAgent {
  async execute(params, projectContext, modelInfo, apiKey, provider) {
    const manager = new SubAgentManager();
    
    // Run multiple agents
    await manager.executeMultiple([
      { subAgent: getSubAgent('readme-md'), /* ... */ },
      { subAgent: getSubAgent('agents-md'), /* ... */ },
      { subAgent: getSubAgent('changelog-md'), /* ... */ }
    ]);
    
    return { success: true };
  }
}
```

### Pattern 3: Provider Adapter

Adapt any OpenAI-compatible API:

```javascript
export class CustomProvider extends BaseProvider {
  constructor(apiKey, modelId) {
    super(apiKey);
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://custom-api.com/v1' // Any compatible API
    });
  }
  
  // Standard implementation works!
  async refinePrompt(/* ... */) { /* ... */ }
}
```

---

## 📚 Documentation Index

### Main Guides
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture overview
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [README.md](README.md) - Getting started

### Module Documentation
- [src/tools/README.md](src/tools/README.md) - Tool system
- [src/sub-agents/README.md](src/sub-agents/README.md) - SubAgent system
- [src/providers/README.md](src/providers/README.md) - Provider system

### Code Examples
- [src/tools/definitions.js](src/tools/definitions.js) - Tool examples
- [src/sub-agents/agents/](src/sub-agents/agents/) - SubAgent examples
- [src/providers/](src/providers/) - Provider examples

---

## 🎯 Quick Start Checklist

### I want to add...

**A new AI function (Tool)**
- [ ] Read [src/tools/README.md](src/tools/README.md)
- [ ] Add to `definitions.js`
- [ ] Set `availableTo` correctly
- [ ] Test locally
- [ ] Submit PR

**A documentation generator (SubAgent)**
- [ ] Read [src/sub-agents/README.md](src/sub-agents/README.md)
- [ ] Create file in `agents/`
- [ ] Export `agentConfig`
- [ ] Register in `index.js`
- [ ] Test with sample project
- [ ] Submit PR

**A new AI model (Provider)**
- [ ] Read [src/providers/README.md](src/providers/README.md)
- [ ] Extend `BaseProvider`
- [ ] Implement `refinePrompt()`
- [ ] Update factory
- [ ] Add models
- [ ] Test streaming and tools
- [ ] Submit PR

---

## ❓ FAQ

**Q: Do I need to modify core files to add a tool?**
A: No! Just add to `definitions.js`. That's it.

**Q: Can I add multiple subagents at once?**
A: Yes! Create multiple files in `agents/` and register them all.

**Q: Will my extensions break on updates?**
A: No. Registry-based systems maintain backward compatibility.

**Q: Can I test extensions locally?**
A: Yes! Use `npm install -g .` to test immediately.

**Q: How do I distribute my extension?**
A: Submit a PR or create a plugin (plugin system coming in v6.0).

---

## 🚀 Get Started

1. **Read:** [CONTRIBUTING.md](CONTRIBUTING.md)
2. **Clone:** `git clone https://github.com/luka-loehr/context-engine.git`
3. **Extend:** Add your tool/agent/provider
4. **Test:** `npm install -g .`
5. **Share:** Submit a PR!

---

*Context Engine: Built for infinite extensibility* 🌟

