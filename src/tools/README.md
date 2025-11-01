# Tool Registry

Central registry for all AI-callable functions with fine-grained access control.

## Access Control

**MAIN**: Main AI only (exit, help, model, api, clear)
**SUBAGENT**: Subagents only (createFile, statusUpdate)
**SHARED**: Both contexts (getFileContent)
**AGENT-SPECIFIC**: Specific subagent IDs via `agentIds` parameter

## Adding a Tool

```javascript
// In src/tools/definitions.js
toolRegistry.register({
  name: 'toolName',
  description: 'What it does and when to use it',
  parameters: {
    type: 'object',
    properties: {
      param: { type: 'string', description: '...' }
    },
    required: ['param']
  },
  availableTo: ToolCategories.SHARED, // or MAIN, or SUBAGENT
  agentIds: ['agent-id'], // Optional: restrict to specific agents
  tags: ['category'],
  handler: async (parameters, context) => {
    // Implementation
    return { success: true, data: ... };
  }
});
```

## Context Data

**Main AI**: projectContext, session, provider, modelInfo
**Subagents**: projectContext, spinner, subAgentName, agentId

## Key Functions

- `getToolsForContext(context, agentId?)` - Get tools for main or subagent
- `getToolsForAgent(agentId)` - Get tools for specific agent
- `executeToolInContext(name, params, context, contextData)` - Execute with access control
- `isToolAvailable(name, context)` - Check availability

## Access Control Logic

1. Check context (main/subagent)
2. If agentIds specified, check agent ID
3. Execute handler with contextData
4. Return result

Tools without agentIds are available to all agents in their context.
Tools with agentIds are only available to specified agents.

