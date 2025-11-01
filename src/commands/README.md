# Command Registry

Registry for CLI commands (chat, model, refine, etc).

## Adding a Command

```javascript
// In src/commands/mycommand.js
export async function myCommand(arg1, arg2) {
  // Implementation
  return result;
}
```

## Registration

```javascript
// In src/commands/index.js or bin/context.js
import { commandRegistry } from './registry.js';
import { myCommand } from './commands/mycommand.js';

commandRegistry.register({
  name: 'mycommand',
  handler: myCommand,
  description: 'Does something useful'
});
```

## Execution

```javascript
await commandRegistry.executeCommand('mycommand', arg1, arg2);
```

## Current Commands

- `chat` - Interactive chat session
- `model` - Change AI model
- `refine` - Refine a prompt

Commands are registered at startup and executed via registry.

