# 🤖 AGENTS.md – AI Agent Guide for context-engine

This guide provides practical instructions for AI coding agents working on **context-engine**.  
context-engine is an interactive CLI tool that lets users chat with their codebase using XAI Grok.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Project Architecture](#-project-architecture)
- [Development Workflow](#-development-workflow)
- [Code Patterns & Standards](#-code-patterns--standards)
- [Tool System](#-tool-system)
- [Subagent System](#-subagent-system)
- [Testing Guide](#-testing-guide)
- [Common Tasks](#-common-tasks)
- [Security & Safety](#-security--safety)

---

## 🚀 Quick Start

### Testing Your Changes
```bash
# Single message mode (best for quick testing)
./bin/context.js test "your test query here"

# Interactive mode
./bin/context.js

# Configuration
./bin/context.js model  # Change AI model
./bin/context.js reset  # Reset configuration
```

### Key Files to Know
| File | Purpose |
|------|---------|
| `src/commands/chat.js` | Main chat session & tool execution |
| `src/tools/definitions.js` | Central tool registry |
| `src/tools/library/` | Tool implementations |
| `src/sub-agents/agents/` | Subagent configurations |
| `src/providers/xai.js` | XAI Grok API integration |
| `src/constants/prompts.js` | System prompts |
| `src/session/banner.js` | UI banners & display |

---

## 🏗️ Project Architecture

### Core Components

```
context-engine/
├── bin/context.js           # CLI entry point
├── src/
│   ├── commands/            # Command handlers (chat, model, refine)
│   ├── tools/               # Tool system (3-tier: main/subagent/shared)
│   ├── sub-agents/          # Modular subagent system
│   ├── providers/           # AI provider integrations (XAI)
│   ├── session/             # Session & conversation management
│   ├── ui/                  # Terminal UI (prompts, output, autocomplete)
│   ├── utils/               # Utilities (tokenizer, stream-writer, scanner)
│   └── constants/           # Models, patterns, prompts
```

### Technology Stack
- **Language**: JavaScript (ES modules)
- **Runtime**: Node.js ≥16.0.0
- **CLI**: Commander.js
- **AI**: XAI Grok (via OpenAI-compatible API)
- **UI**: chalk, ora, inquirer, highlight.js

---

## 🔄 Development Workflow

### 1. Understanding the Code
```bash
# Read files as needed - agent has getFileContent tool
# Initial context is auto-injected from project scan

# Example workflow:
# 1. User asks question
# 2. Agent reads relevant files
# 3. Agent executes tools if needed
# 4. Agent streams response with syntax highlighting
```

### 2. Making Changes
1. **Read the file** first using `getFileContent`
2. **Make targeted changes** - avoid rewriting entire files
3. **Test immediately** with `./bin/context.js test "..."`
4. **Check for errors** - look for visual feedback in output
5. **Verify behavior** matches expectations

### 3. Visual Feedback Pattern
```javascript
// All async operations show spinners:
const spinner = ora(`Action description`).start();

// Complete with random delay for smooth UX:
const delay = 500 + Math.random() * 500;
setTimeout(() => {
  spinner.succeed(`Action completed`);
}, delay);
```

This pattern is used for:
- ✅ File reading: `Reading filename.js` → `Read filename.js (2.1k)`
- ✅ Commands: `Running: ls -la` → `Ran: ls -la`
- ✅ Subagents: `GitHub Agent working...` → `GitHub Agent completed`

---

## 📐 Code Patterns & Standards

### ES Module Imports
```javascript
// Always use ES module syntax
import chalk from 'chalk';
import { someFunction } from './utils.js';

// Always include .js extension in relative imports
import { tool } from './tools/definitions.js';  // ✓ Correct
import { tool } from './tools/definitions';     // ✗ Wrong
```

### Tool Handler Pattern
```javascript
{
  name: 'toolName',
  category: 'categoryName',
  description: 'Clear description for AI',
  parameters: {
    type: 'object',
    properties: {
      param: {
        type: 'string',
        description: 'What this parameter does'
      }
    },
    required: ['param']
  },
  handler: async (parameters, context) => {
    // Your implementation
    return {
      success: true,
      content: 'Result content',
      // ... other fields
    };
  }
}
```

### Stream Writer Usage
```javascript
import { createStreamWriter } from '../utils/stream-writer.js';

const streamWriter = createStreamWriter();

// In streaming callback:
(content) => {
  streamWriter.write(content);
}

// After streaming completes:
streamWriter.flush();
```

### Terminal Colors
```javascript
import chalk from 'chalk';

// Standard color scheme:
chalk.cyan('Highlighted text')     // File names, commands, highlights
chalk.gray('Subdued text')         // Labels, metadata
chalk.green('Success')             // Success messages
chalk.red('Error')                 // Errors
chalk.yellow('Warning')            // Warnings, less important info
chalk.magenta('Special')           // Model names (context-ultra)
chalk.white.bold('Emphasis')       // Important text
```

---

## 🛠️ Tool System

### Three-Tier Access Control

| Access Level | Available To | Example Tools |
|--------------|--------------|---------------|
| **MAIN** | Main AI only | `exit`, `help`, `clear`, `model`, `api` |
| **SUBAGENT** | Subagents only | `createFile`, `statusUpdate` |
| **SHARED** | Both main & subagents | `getFileContent`, `terminal` |

### Adding a New Tool

1. **Create the tool in** `src/tools/library/`:
```javascript
export const myTools = [
  {
    name: 'myTool',
    category: 'myCategory',
    description: 'What it does',
    parameters: { /* JSON schema */ },
    handler: async (parameters, context) => {
      // Implementation
      return { success: true, data: result };
    }
  }
];
```

2. **Register in** `src/tools/definitions.js`:
```javascript
import { myTools } from './library/my-tools.js';

// Add to appropriate section:
const SHARED_TOOLS = [
  ...myTools,
  // ... other tools
];
```

3. **Test it**:
```bash
./bin/context.js test "use myTool to do something"
```

### Tool Response Format
```javascript
// Success response:
{
  success: true,
  content: 'String content for AI',  // Main content
  metadata: { /* optional */ },       // Additional data
  stopLoop: false                     // Set true to stop chat loop
}

// Error response:
{
  success: false,
  error: 'Error message',
  output: 'Partial output if any'
}
```

---

## 🤖 Subagent System

### Creating a New Subagent

1. **Create agent file** in `src/sub-agents/agents/`:
```javascript
export const myAgentConfig = {
  id: 'my-agent',
  name: 'My Agent',
  description: 'What this agent does',
  
  tools: [
    // Tools available to this subagent
    'getFileContent',
    'createFile',
    'statusUpdate'
  ],
  
  systemPrompt: `You are My Agent.
Your job is to [specific task].

Guidelines:
- Be specific
- Follow patterns
- Return structured data`,

  triggerPhrases: [
    'my agent',
    'do my task',
    'generate my thing'
  ]
};
```

2. **Register in** `src/sub-agents/agents/index.js`:
```javascript
import { myAgentConfig } from './my-agent.js';

export const subAgentConfigs = [
  myAgentConfig,
  // ... other agents
];
```

3. **Test natural language invocation**:
```bash
./bin/context.js test "use my agent to do something"
```

### Subagent Best Practices
- ✅ Keep subagents focused on **one specific task**
- ✅ Return **structured, parseable output**
- ✅ Use `statusUpdate` tool to show progress
- ✅ Include clear trigger phrases
- ❌ Don't make subagents too broad
- ❌ Don't expose dangerous tools to subagents

---

## 🧪 Testing Guide

### Quick Testing Checklist
```bash
# 1. Basic functionality
./bin/context.js test "what files are in src/"

# 2. File reading
./bin/context.js test "read package.json and tell me the version"

# 3. Terminal commands
./bin/context.js test "show git status"

# 4. Subagent invocation
./bin/context.js test "use github agent to show branches"

# 5. Error handling
./bin/context.js test "read nonexistent.js"
```

### Visual Output Verification
Check that:
- ✅ Spinners show and complete properly
- ✅ File reads show: `Reading file.js` → `Read file.js (tokens)`
- ✅ Commands show: `Running: cmd` → `Ran: cmd`
- ✅ No "Loading file (0)" spam
- ✅ Syntax highlighting works in code blocks
- ✅ Line wrapping is clean and readable

### Common Test Scenarios
```bash
# Multi-file reading (concurrent spinners)
./bin/context.js test "read package.json and src/commands/chat.js"

# Command execution
./bin/context.js test "run ls -la"

# Error cases
./bin/context.js test "execute rm -rf /"  # Should be blocked
```

---

## 💼 Common Tasks

### Task 1: Add a New Terminal Command
```javascript
// In src/tools/library/execution-tools.js
// Commands are already safe-guarded - just use the terminal tool
```

### Task 2: Modify System Prompt
```javascript
// Edit src/constants/prompts.js
export const SYSTEM_PROMPT = `Updated prompt...`;

// Test immediately:
./bin/context.js test "test the updated behavior"
```

### Task 3: Add UI Element
```javascript
// In src/session/banner.js or src/ui/output.js
import chalk from 'chalk';

console.log(chalk.cyan('Your message'));
```

### Task 4: Update File Reading UI
```javascript
// In src/commands/chat.js around line 324
const localSpinner = ora(`Reading ${chalk.cyan(fileName)}`).start();

// Later:
localSpinner.succeed(`Read ${chalk.cyan(fileName)} (tokens)`);
```

---

## 🔒 Security & Safety

### Blocked Operations
```javascript
// These patterns are blocked in terminal tool:
'rm -rf', 'rm -fr', 'sudo rm',
'git push --force', 'git reset --hard',
'git commit', 'git push', 'git pull',
// ... see src/tools/library/execution-tools.js
```

### Safe Patterns
- ✅ Read-only git commands: `git status`, `git log`, `git branch`
- ✅ File reading: Always safe
- ✅ Directory listing: Always safe
- ❌ File writing: Only through controlled tools
- ❌ Destructive operations: Blocked

### API Key Handling
```javascript
// Keys are stored in config
import { getConfig } from '../config/config.js';

const apiKey = getConfig('xai_api_key');

// Never log or expose keys
// Never commit keys to git
```

---

## 📝 Important Notes

### Terminology
- **"Read" not "Load"**: Files are "read" (e.g., `Reading file.js`, `Read file.js`)
- **"Running" not "Executing"**: Commands are "running" (e.g., `Running: ls`, `Ran: ls`)
- **"Context" not "Files"**: Initial project scan is "context injection"

### UI Consistency
- All spinners use `ora` with consistent messages
- All async operations complete with random 500-1000ms delay
- File tokens shown as: `(2.1k)` or `(460)` using `formatTokenCount()`
- Command colors: cyan for emphasis, gray for subdued

### Best Practices
1. ✅ Always test changes with `./bin/context.js test`
2. ✅ Read files before modifying them
3. ✅ Follow existing patterns (spinners, colors, structure)
4. ✅ Keep changes minimal and targeted
5. ✅ Verify visual output looks clean
6. ❌ Don't rewrite entire files unnecessarily
7. ❌ Don't break the streaming response pattern
8. ❌ Don't expose security-sensitive operations

---

## 🎯 Agent Success Checklist

- [ ] Understood the three-tier tool system
- [ ] Know how to test changes quickly
- [ ] Familiar with visual feedback patterns
- [ ] Can navigate the architecture
- [ ] Know the security boundaries
- [ ] Understand ES module import patterns
- [ ] Can create and register new tools
- [ ] Can create and register subagents

---

**Remember**: The `test` command is your best friend. Use it constantly for rapid iteration! 🚀

Developed by [Luka Löhr](https://github.com/luka-loehr)
