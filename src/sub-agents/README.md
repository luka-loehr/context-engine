# SubAgent Registry

Registry-based system for specialized AI agents that generate documentation files.

## Architecture

Agents are registered via `agentConfig` exports. Each agent gets its own tool set based on context and agentId.

## Creating a SubAgent

```javascript
// In src/sub-agents/agents/myagent.js
import { SubAgent } from '../core/base.js';

export class MyAgent extends SubAgent {
  constructor() {
    super('FILE.md', 'Creating FILE.md', 'my-agent-id');
  }

  getSystemPrompt() {
    return `Expert at creating FILE.md...`;
  }

  getInitialPrompt() {
    return `Analyze and create FILE.md...`;
  }
}

export const agentConfig = {
  name: 'FILE.md',
  id: 'my-agent-id',
  toolName: 'createMyFile',
  description: 'Creates FILE.md...',
  agentClass: MyAgent
};
```

## Registration

```javascript
// In src/sub-agents/index.js
import { agentConfig as myAgentConfig } from './agents/myagent.js';
registry.register(myAgentConfig);
```

## Tool Access

Agents automatically get:
- All SHARED tools
- All SUBAGENT tools
- Tools with their agentId in agentIds array

Pass agentId in constructor to enable agent-specific tools.

## Concurrent Execution

SubAgentManager handles multiple agents in parallel with coordinated UI.
Agents are batched when AI calls multiple creation tools simultaneously.

## Key Points

- Agents inherit from SubAgent
- Must implement getSystemPrompt() and getInitialPrompt()
- agentId enables agent-specific tools
- Tools execute with access control via ToolRegistry
- Status updates handled automatically by base class

