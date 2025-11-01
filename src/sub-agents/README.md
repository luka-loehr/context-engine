# SubAgent System Documentation

The Context Engine SubAgent System is a modular, registry-based architecture that allows unlimited concurrent AI agents to work together on documentation and code generation tasks.

## Architecture Overview

```
src/sub-agents/
├── core/                   # Core system components
│   ├── base.js            # SubAgent base class
│   ├── manager.js         # SubAgentManager for concurrent execution
│   └── registry.js        # SubAgentRegistry for dynamic registration
├── agents/                 # Individual agent implementations
│   ├── agents-md.js       # AGENTS.md creator
│   └── readme-md.js       # README.md creator
└── index.js               # Entry point & agent registration
```

## Key Components

### 1. **SubAgent Base Class** (`core/base.js`)
- Abstract base class for all subagents
- Provides standard tools: `getFileContent`, `createFile`, `statusUpdate`
- Handles AI provider integration and tool execution

### 2. **SubAgentRegistry** (`core/registry.js`)
- Central registry for all available subagents
- Auto-generates tool definitions for AI
- Dynamic agent discovery and instantiation
- Thread-safe for concurrent operations

### 3. **SubAgentManager** (`core/manager.js`)
- Orchestrates concurrent subagent execution
- Multi-line status updates with `log-update`
- Individual progress tracking per agent
- Coordinated UI with header spinner

## Creating a New SubAgent

### Step 1: Create Agent File

Create a new file in `src/sub-agents/agents/` (e.g., `changelog-md.js`):

```javascript
import { SubAgent } from '../core/base.js';

export class ChangelogSubAgent extends SubAgent {
  constructor() {
    super('CHANGELOG.md', 'Creating CHANGELOG.md');
  }

  getSystemPrompt() {
    return `You are an expert at creating CHANGELOG.md files...
    
    [Your detailed system prompt here]
    `;
  }

  getInitialPrompt() {
    return `Please analyze this codebase and create a CHANGELOG.md...`;
  }
}

// Export agent configuration for auto-registration
export const agentConfig = {
  name: 'CHANGELOG.md',
  id: 'changelog-md',
  toolName: 'createChangelog',
  description: 'Create a CHANGELOG.md file with version history and release notes.',
  agentClass: ChangelogSubAgent
};
```

### Step 2: Register in Index

Add to `src/sub-agents/index.js`:

```javascript
import { agentConfig as changelogConfig } from './agents/changelog-md.js';

registry.register(changelogConfig);
```

### Step 3: Done!

That's it! Your agent is now:
- ✅ Available as a tool to the AI (`createChangelog`)
- ✅ Supports concurrent execution with other agents
- ✅ Integrated with the SubAgentManager UI
- ✅ Automatically handled by chat.js

## Agent Configuration

Each agent must export an `agentConfig` object with:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ✅ | Display name (e.g., "CHANGELOG.md") |
| `id` | string | ✅ | Unique identifier (e.g., "changelog-md") |
| `toolName` | string | ✅ | AI tool function name (e.g., "createChangelog") |
| `description` | string | ✅ | Description for AI tool usage |
| `agentClass` | Class | ✅ | The SubAgent class |

## Concurrent Execution

The system automatically detects when multiple subagent tools are called simultaneously:

### Single Agent
```
User: "create agents.md"
→ Standard execution with spinner
```

### Multiple Agents (Concurrent)
```
User: "create agents.md and readme.md"
→ SubAgentManager orchestrates both
→ Live status updates for each
→ Executes in parallel
```

### UI Example (Concurrent)
```
⠋ 2 Subagents working...

  AGENTS.md: Reading package.json
  README.md: Analyzing project structure
```

## How It Works

### 1. Registration Phase
```javascript
// At startup, all agents register themselves
registry.register(agentConfig);
// Tools are auto-generated and added to AI tool list
```

### 2. Tool Call Detection
```javascript
// In chat.js, when AI calls a tool:
if (isSubAgentTool(toolName)) {
  // Intelligent batching logic activates
  // Coordinator pattern detects concurrent calls
}
```

### 3. Execution Phase
```javascript
// Single agent → Direct execution
// Multiple agents → SubAgentManager.executeMultiple()
```

### 4. Status Updates
```javascript
// Each agent calls statusUpdate tool
// Manager intercepts and displays progress
// Individual spinners for each agent
```

### 5. Completion
```javascript
// All agents complete
// Summary displayed
// AI provides feedback to user
```

## Advanced Features

### Custom Tools
Add custom tools to your subagent:

```javascript
getTools() {
  const baseTools = super.getTools();
  return [
    ...baseTools,
    {
      name: 'analyzeGitHistory',
      description: 'Analyze git commit history',
      parameters: { /* ... */ }
    }
  ];
}
```

### Custom Tool Handlers
Override tool execution in your subagent:

```javascript
async execute(params, projectContext, modelInfo, apiKey, provider) {
  // Custom pre-execution logic
  const result = await super.execute(params, projectContext, modelInfo, apiKey, provider);
  // Custom post-execution logic
  return result;
}
```

## Best Practices

### ✅ DO
- Use descriptive, concise status updates (1-10 words)
- Call `statusUpdate` BEFORE starting each activity
- Make at least 6 status updates during exploration
- Use clear, user-friendly success messages
- Follow markdown formatting guidelines

### ❌ DON'T
- Hardcode agent-specific logic in `chat.js` or `tools.js`
- Create agents without proper `agentConfig` export
- Skip status updates (users love seeing progress)
- Use blocking operations without status feedback
- Forget to include `successMessage` in `createFile` calls

## Scaling to 10+ Agents

The system is designed to handle unlimited concurrent agents:

```javascript
// Example: 10 concurrent agents
User: "create all documentation files"
AI calls:
- createAgentsMd
- createReadme
- createChangelog
- createContributing
- createCodeOfConduct
- createLicense
- createSecurity
- createRoadmap
- createArchitecture
- createApiDocs

→ SubAgentManager orchestrates all 10
→ Parallel execution with individual progress
→ Clean UI with status for each
→ Completion summary with all files listed
```

## Testing Your Agent

```javascript
// Test single execution
const agent = getSubAgent('your-agent-id');
await agent.execute({}, projectContext, modelInfo, apiKey, provider);

// Test concurrent execution
const manager = new SubAgentManager();
await manager.executeMultiple([
  { subAgent: agent1, ... },
  { subAgent: agent2, ... }
]);
```

## Debugging

Enable verbose logging:
```javascript
// In your agent's execute method
console.log('[Your Agent] Status:', status);
```

Check registry state:
```javascript
import { registry } from './core/registry.js';
console.log('Registered agents:', registry.getAllAgentIds());
console.log('Tool definitions:', registry.getAllToolDefinitions());
```

## Future Enhancements

- [ ] Auto-discovery: Scan `agents/` folder and register automatically
- [ ] Agent dependencies: One agent can call another
- [ ] Agent pipelines: Chain agents in sequence
- [ ] Agent priorities: Control execution order
- [ ] Agent hooks: Pre/post execution callbacks
- [ ] Agent testing framework: Built-in test utilities

## Contributing

To add your subagent to Context Engine:

1. Create your agent in `agents/` folder
2. Follow naming convention: `{purpose}-{format}.js`
3. Include comprehensive system prompts
4. Test with both single and concurrent execution
5. Document any special requirements
6. Submit PR with examples

---

*For questions or issues, open an issue on [GitHub](https://github.com/luka-loehr/context-engine)*

