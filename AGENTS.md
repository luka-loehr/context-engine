# Context-Engine AGENTS.md

This AGENTS.md file provides comprehensive guidance for AI coding agents working on the context-engine project. Context-engine is an interactive AI-powered codebase assistant using XAI Grok that allows users to chat with their code and get instant answers.

## Project Overview

Context-engine is a sophisticated CLI tool that provides AI-powered codebase analysis and assistance. The architecture is modular with clear separation between core functionality, subagents, tools, and providers.

Key components:
- **Core Language**: JavaScript (Node.js) with ES modules
- **CLI Framework**: Commander.js for command handling
- **AI Provider**: XAI Grok API integration
- **Architecture**: Modular with auto-discoverable subagents and tools
- **Tool System**: Context-based tool registry (main, subagent, shared access levels)
- **Subagent System**: Modular subagents with natural language invocation

## Essential Commands for Agent Testing

### Test Command (For Agent Development)
```bash
# Single message mode - perfect for testing agent responses without interactive mode
./bin/context.js test "your test message here"

# Examples:
./bin/context.js test "tell me which branches exist"
./bin/context.js test "use github to show recent commits"
./bin/context.js test "what files are in the src directory"
```

This command is invaluable for agents like you to quickly test functionality, verify tool integration, and ensure responses are working correctly without entering interactive mode.

### Interactive Mode
```bash
# Start full interactive chat session
./bin/context.js
```

### Configuration Commands
```bash
# Reset model selection
./bin/context.js reset

# Change AI model
./bin/context.js model
```

## Architecture Deep Dive

### Tool System
The tool system uses a registry pattern with three access levels:
- **MAIN**: Tools only available to the main AI (exit, help, clear, etc.)
- **SUBAGENT**: Tools only available to subagents (createFile, statusUpdate, etc.)
- **SHARED**: Tools available to both (getFileContent, terminalReadOnly, etc.)

### Subagent System
Subagents are auto-discovered and can be invoked naturally:
- GitHub subagent: "tell me about branches", "show recent commits"
- Each subagent has specific tools and capabilities
- Subagents return structured responses for AI consumption

### Key Files and Their Roles
- `src/tools/definitions.js`: Central tool registration
- `src/sub-agents/agents/`: Individual subagent configurations
- `src/providers/`: AI provider integrations (XAI, etc.)
- `src/commands/chat.js`: Main chat session handling
- `src/tools/library/execution-tools.js`: Terminal execution tools

## Development Guidelines

### When Adding New Tools
1. Define tool in appropriate category (MAIN/SUBAGENT/SHARED)
2. Add to `src/tools/definitions.js`
3. Ensure proper parameter validation
4. Test with both main AI and subagents

### When Creating Subagents
1. Create configuration in `src/sub-agents/agents/`
2. Register in subagent index
3. Define appropriate tools and system prompt
4. Test natural language invocation

### Testing Best Practices
- Use the `test` command for quick verification
- Test both success and error cases
- Verify tool output format matches AI consumption requirements
- Ensure no sensitive data exposure in responses

## Terminal Tool Integration

The `terminalReadOnly` tool is specifically designed for read-only git/GitHub operations:
- Executes git commands safely (read-only)
- Captures both stdout and stderr
- Returns structured output for AI consumption
- Integrated with GitHub subagent for branch/commit analysis

## Security Considerations

- All terminal operations are read-only
- No write operations allowed through terminal tools
- API keys are handled securely through environment variables
- Subagents operate with limited, defined capabilities

## Common Issues and Solutions

1. **"Loaded file (0)" messages**: These are suppressed for cleaner output - the spinner logic only shows meaningful file operations
2. **Tool not found**: Check tool registration in definitions.js and access level
3. **Subagent not responding**: Verify subagent configuration and tool availability
4. **API key issues**: Ensure XAI_API_KEY is set in environment or .env file

## Testing Checklist for Agents

- [ ] Test basic chat functionality
- [ ] Test GitHub subagent with branch queries
- [ ] Test terminalReadOnly tool execution
- [ ] Verify clean output without loading spam
- [ ] Test error handling and edge cases
- [ ] Verify tool output format for AI consumption

Remember: The `test` command is your best friend for rapid iteration and verification!