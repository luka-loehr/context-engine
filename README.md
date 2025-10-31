# context-engine

> Interactive AI-powered codebase assistant - chat with your XAI Grok models

context-engine is a command-line tool that helps you interact with your codebase using XAI's Grok AI models. Ask questions about your code, understand architecture, and get instant answers powered by Grok.

## ✨ Features

- **Natural Language Queries**: Ask questions about your codebase in plain English
- **Multi-Model Support**: Choose between Grok models optimized for different use cases
- **Persistent API Keys**: Store your XAI API key securely for easy access
- **Interactive Chat**: Conversational interface for exploring your code
- **Smart Context**: Automatically includes relevant code files in your queries

## 🚀 Installation

```bash
npm install -g @lukaloehr/context-engine
```

## 🔧 Setup

### 1. Get your XAI API Key

Visit [XAI Platform](https://x.ai) to get your API key.

### 2. Import your API Key

Run context-engine and use the `/api` command to import your key from a `.env` file:

```bash
context-engine
```

Then in the chat:
```
/api
# Select "Import from .env file"
```

Your `.env` file should contain:
```env
XAI_API_KEY=xai-your_api_key_here
```

### 3. Alternative: Set Environment Variable

```bash
export XAI_API_KEY="xai-your_api_key_here"
```

## 💬 Usage

### Start Interactive Chat

```bash
context-engine
```

### Available Commands

- `/help` - Show available commands
- `/model` - Switch between XAI Grok models
- `/api` - Manage your XAI API key
- `/clear` - Clear conversation history
- `/exit` - Exit context-engine

### Example Interaction

```bash
$ context-engine

context-engine v4.0.0 - Interactive AI-powered codebase assistant

Context loaded (15k tokens)

> What does this project do?

The project appears to be a command-line tool called "context-engine" that serves as an
interactive AI-powered codebase assistant. It allows users to chat with their
codebase using XAI Grok models to understand architecture, ask questions, and
get instant answers about their code.

> /model

Change Model
Current model: context-engine

? Select a model: context-engine-ultra (Premium reasoning model)

Switched to context-engine-ultra

> Now analyze the authentication flow

Based on the code structure, the authentication appears to be handled through...
```

## 🤖 Available Models

| Model | Description | Best For |
|-------|-------------|----------|
| **context-engine** | Grok 4 Fast (non-reasoning) | Fast responses, cost-effective |
| **context-engine-ultra** | Grok 4 Fast (reasoning) | Deep analysis, complex reasoning |w

## 📁 Project Structure

```
src/
├── commands/          # CLI commands
├── config/           # Configuration management
├── constants/        # Model definitions & prompts
├── providers/        # XAI integration
├── ui/              # User interface components
└── utils/           # Helper utilities
```

## 🔒 Privacy

- API keys are stored securely using your system's keychain
- Only necessary code files are sent to XAI's servers
- No data is collected or stored by promptx

## 🛠️ Development

```bash
git clone https://github.com/luka-loehr/promptx-cli.git
cd promptx-cli
npm install
npm run build  # if needed
```

## 📄 License

MIT - see [LICENSE](LICENSE) for details

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 🔗 Links

- [GitHub Repository](https://github.com/luka-loehr/context-engine)
- [XAI Platform](https://x.ai)
- [Issues](https://github.com/luka-loehr/context-engine/issues)
