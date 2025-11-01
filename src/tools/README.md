# Tool System Documentation

The Context Engine Tool System is a modular, registry-based architecture with fine-grained access control. Tools are defined once and can be assigned to specific contexts (main AI, subagents, or shared).

## Architecture Overview

```
src/tools/
├── registry.js        # ToolRegistry class with access control
├── definitions.js     # All tool definitions and handlers
├── helpers.js         # Helper functions for tool access
├── index.js           # Module entry point
└── README.md          # This file
```

## Tool Categories

### 1. **MAIN** - Main AI Only
Tools available only to the primary AI assistant:
- `exit` - Exit the CLI session
- `help` - Show version and tips
- `model` - Change AI model
- `api` - Manage API keys
- `clear` - Clear conversation history

**Why restricted?** These tools control the application state and should only be accessible to the user-facing AI.

### 2. **SUBAGENT** - Subagents Only
Tools available only to sub-agents:
- `createFile` - Write files to disk
- `statusUpdate` - Update progress UI

**Why restricted?** File writing is a privileged operation that main AI shouldn't perform directly. Status updates are specific to subagent workflows.

### 3. **SHARED** - Both Contexts
Tools available to both main AI and subagents:
- `getFileContent` - Read file contents from project

**Why shared?** Both main AI and subagents need to read files for analysis.

### 4. **AGENT-SPECIFIC** - Specific Subagents Only
Tools can be restricted to specific subagent IDs:
- `analyzeAgentStructure` - Only for `agents-md` subagent

**Why agent-specific?** Some tools are only relevant to certain subagents and shouldn't clutter other agents' tool lists.

## Access Control Matrix

| Tool | Main AI | Subagent | Reason |
|------|---------|----------|--------|
| `getFileContent` | ✅ | ✅ | Both need to read files |
| `createFile` | ❌ | ✅ | Only subagents write files |
| `statusUpdate` | ❌ | ✅ | Subagent workflow only |
| `exit` | ✅ | ❌ | System control |
| `help` | ✅ | ❌ | User-facing only |
| `model` | ✅ | ❌ | System control |
| `api` | ✅ | ❌ | System control |
| `clear` | ✅ | ❌ | System control |

## Adding a New Tool

### Step 1: Define the Tool

Add to `src/tools/definitions.js`:

```javascript
toolRegistry.register({
  name: 'analyzeCode',
  description: 'Analyze code complexity and provide metrics',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path to the file to analyze'
      }
    },
    required: ['filePath']
  },
  availableTo: ToolCategories.SHARED, // or MAIN, or SUBAGENT
  tags: ['analysis', 'code'],
  handler: async (parameters, context) => {
    const { filePath } = parameters;
    const { projectContext } = context;
    
    // Your tool logic here
    const file = projectContext.find(f => f.path === filePath);
    const complexity = analyzeComplexity(file.content);
    
    return {
      success: true,
      complexity,
      filePath
    };
  }
});
```

### Step 2: That's It!

The tool is now available:
- ✅ Automatically added to appropriate AI tool lists
- ✅ Access control enforced by registry
- ✅ Can be executed via `executeToolInContext()`

## Tool Configuration

Each tool requires:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Unique tool identifier |
| `description` | string | ✅ | Description for AI (how/when to use) |
| `parameters` | object | ✅ | JSON Schema for parameters |
| `handler` | function | ✅ | Async function to execute tool |
| `availableTo` | string/array | ✅ | 'main', 'subagent', 'shared', or array |
| `tags` | array | ❌ | Optional tags for categorization |

## Handler Function

Handler signature:
```javascript
async function handler(parameters, contextData) {
  // parameters: Object with tool parameters
  // contextData: Execution context (projectContext, spinner, etc.)
  
  return {
    success: boolean,
    // ... other result fields
  };
}
```

### Context Data

Available in `contextData`:

**For Main AI:**
- `projectContext` - Array of project files
- `session` - Chat session object
- `provider` - AI provider instance
- `modelInfo` - Current model information

**For Subagents:**
- `projectContext` - Array of project files
- `spinner` - Ora spinner instance
- `subAgentName` - Name of the subagent
- `isFirstStatusUpdate` - Boolean flag

## Usage Examples

### Get Tools for Context

```javascript
import { getToolsForContext } from './tools/index.js';

// Get tools for main AI
const mainTools = getToolsForContext('main');
// Returns: [getFileContent, exit, help, model, api, clear]

// Get tools for subagents
const subagentTools = getToolsForContext('subagent');
// Returns: [getFileContent, createFile, statusUpdate]
```

### Execute Tool

```javascript
import { executeToolInContext } from './tools/index.js';

// Execute in main context
const result = await executeToolInContext(
  'getFileContent',
  { filePath: 'package.json' },
  'main',
  { projectContext }
);

// Execute in subagent context
const result = await executeToolInContext(
  'createFile',
  { filePath: 'README.md', content: '# Hello', successMessage: 'Created!' },
  'subagent',
  { projectContext, spinner }
);
```

### Check Tool Availability

```javascript
import { isToolAvailable } from './tools/index.js';

// Check if tool is available in context
if (isToolAvailable('createFile', 'main')) {
  // Will be false - createFile is subagent-only
}

if (isToolAvailable('getFileContent', 'subagent')) {
  // Will be true - getFileContent is shared
}
```

## Advanced Features

### Multiple Availabilities

A tool can be available in multiple specific contexts:

```javascript
toolRegistry.register({
  name: 'specialTool',
  availableTo: ['main', 'subagent'], // Both, but not via 'shared'
  // ...
});
```

### Tags for Organization

```javascript
toolRegistry.register({
  name: 'readFile',
  tags: ['file', 'read', 'io'],
  // ...
});

// Later, get all file tools
const fileTools = toolRegistry.getToolsByTag('file');
```

### Dynamic Tool Registration

Register tools at runtime:

```javascript
// In a plugin or extension
import { toolRegistry } from './tools/index.js';

toolRegistry.register({
  name: 'customTool',
  description: 'My custom tool',
  // ...
});
```

### Tool Statistics

```javascript
const stats = toolRegistry.getStats();
// {
//   total: 8,
//   main: 5,
//   subagent: 2,
//   shared: 1,
//   byTag: { file: 3, system: 5, ui: 1 }
// }
```

## Security Considerations

### Why Access Control?

1. **Principle of Least Privilege**: Each context gets only necessary tools
2. **Separation of Concerns**: Main AI handles interaction, subagents handle execution
3. **Safety**: Prevents main AI from directly writing files (goes through controlled subagents)
4. **Auditability**: Clear which context executed which tool

### Access Violation Example

```javascript
// Main AI tries to use createFile
await executeToolInContext('createFile', params, 'main', context);
// Returns: { success: false, error: "Tool 'createFile' is not available in main context" }
```

## Testing

### Unit Test a Tool

```javascript
import { toolRegistry } from './tools/index.js';

// Get tool definition
const tool = toolRegistry.tools.get('getFileContent');

// Test handler directly
const result = await tool.handler(
  { filePath: 'test.js' },
  { projectContext: [{ path: 'test.js', content: 'code' }] }
);

expect(result.success).toBe(true);
expect(result.content).toBe('code');
```

### Test Access Control

```javascript
import { isToolAvailable } from './tools/index.js';

expect(isToolAvailable('createFile', 'main')).toBe(false);
expect(isToolAvailable('createFile', 'subagent')).toBe(true);
expect(isToolAvailable('getFileContent', 'main')).toBe(true);
expect(isToolAvailable('getFileContent', 'subagent')).toBe(true);
```

## Migration Guide

### From Old System

**Before (hardcoded in base.js):**
```javascript
// In base.js
getTools() {
  return [
    { name: 'getFileContent', /* ... */ },
    { name: 'createFile', /* ... */ }
  ];
}
```

**After (registry-based):**
```javascript
// In definitions.js (once)
toolRegistry.register({ name: 'getFileContent', /* ... */ });
toolRegistry.register({ name: 'createFile', /* ... */ });

// In base.js (reusable)
getTools() {
  return getToolsForContext('subagent');
}
```

## Best Practices

### ✅ DO
- Define tools once in `definitions.js`
- Use `SHARED` for tools needed by both contexts
- Provide clear, detailed descriptions for AI
- Use JSON Schema for parameter validation
- Return consistent result objects
- Add tags for organization
- Test access control

### ❌ DON'T
- Hardcode tool definitions in multiple places
- Give main AI file write permissions
- Forget to handle errors in handlers
- Use overly permissive `availableTo` settings
- Skip parameter validation
- Ignore context data in handlers

## Future Enhancements

- [ ] Role-based access control (admin, user, guest)
- [ ] Tool usage auditing and logging
- [ ] Rate limiting for expensive tools
- [ ] Tool chaining and dependencies
- [ ] Dynamic permission updates
- [ ] Tool versioning
- [ ] Tool marketplace/plugins

## Troubleshooting

### Tool Not Available

**Problem:** `executeToolInContext` returns "tool not available"

**Solution:** Check `availableTo` in tool definition matches your context

### Tool Not Found

**Problem:** `toolRegistry.hasTool('myTool')` returns false

**Solution:** Ensure tool is registered in `definitions.js` and `initializeToolRegistry()` is called

### Handler Error

**Problem:** Tool execution throws error

**Solution:** Wrap handler logic in try-catch, return `{ success: false, error }` on failure

---

*For questions or issues, open an issue on [GitHub](https://github.com/luka-loehr/context-engine)*

