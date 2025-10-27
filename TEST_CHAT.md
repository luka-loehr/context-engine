# Testing promptx Chat Interface

## How to Test

1. Navigate to a project directory:
```bash
cd /path/to/your/project
```

2. Start promptx:
```bash
promptx
```

3. It will:
   - Scan all files in your project
   - Show "Ask me anything about your codebase!"
   - Wait for your input

4. Try asking questions like:
   - "What does this project do?"
   - "How is the codebase structured?"
   - "Where is the configuration file?"
   - "Explain the authentication flow"

5. After each answer, you can ask follow-up questions

6. Exit with `/exit`

## Available Commands

- `/help` - Show help menu
- `/exit` - Exit chat session
- `/clear` - Clear conversation history
- `/model` - Switch AI models (requires restart)

## Features

✅ Always scans project files (no --pro flag needed)
✅ Maintains conversation history
✅ Allows follow-up questions
✅ Only exits when you type /exit
✅ Chat-based interface instead of single prompt/response

