# context-engine

> Chat with your codebase using XAI Grok AI – instant answers, intelligent context

**context-engine** is a terminal-based AI assistant that understands your entire codebase. Ask questions in natural language and get instant, contextually-aware answers powered by XAI's Grok models.

## ✨ Features

- 🤖 **Smart Context Loading** – Automatically scans and loads your project structure
- 💬 **Interactive Chat** – Natural conversation with your codebase
- 🚀 **Multi-Model Support** – Switch between fast and reasoning models
- 🎨 **Beautiful Output** – Color-coded, formatted responses with code highlighting
- 🔒 **Secure** – API keys stored in system keychain
- ⚡ **Fast** – Lightweight CLI with instant startup

## 📦 Installation

```bash
npm install -g @lukaloehr/context-engine
```

## 🚀 Quick Start

### 1. Set your XAI API Key

Get your API key from [x.ai](https://x.ai), then:

```bash
export XAI_API_KEY="xai-your_api_key_here"
```

Or create a `.env` file in your project:
```env
XAI_API_KEY=xai-your_api_key_here
```

### 2. Start chatting

```bash
cd your-project
context
```

That's it! The tool will load your project and start an interactive chat session.

## 💬 Usage

### Commands

- `/help` – Show available commands
- `/model` – Switch between models
- `/api` – Import API key from .env
- `/clear` – Clear conversation history
- `/exit` – Exit the chat

### Example Session

```bash
$ context

/home/user/my-project git:(main)

* Welcome to context-engine!

cwd: /home/user/my-project
loaded: 42 files (8.2k)

> What does this project do?

Project Overview

This is a web application built with React and Express...

> Show me the authentication flow

[Authentication Flow]

The app uses JWT tokens for authentication...

> /exit
```

## 🤖 Models

| Model | Description | Use Case |
|-------|-------------|----------|
| **context** | Grok 4 Fast (non-reasoning) | Quick answers, general queries |
| **context-ultra** | Grok 4 Fast (reasoning) | Deep analysis, complex problems |

Switch models anytime with `/model` during a chat session.

## 🎨 Output Formatting

Responses are beautifully formatted with:

- **Headlines** – Bold section headers
- **Code blocks** – Blue syntax highlighting
- **Inline code** – Yellow/orange for commands and filenames
- **Horizontal rules** – Clean section separators
- **Smart wrapping** – Proper indentation for lists

## 🔧 Configuration

API keys are stored securely using your system's keychain via the `conf` package. Use `/api` in the chat to manage keys or set the `XAI_API_KEY` environment variable.

## 📁 Project Structure

```
src/
├── commands/       # CLI commands (chat, model, help)
├── config/         # Configuration management
├── constants/      # Models, prompts, patterns
├── providers/      # XAI API integration
├── ui/             # Terminal UI components
└── utils/          # Tokenizer, scanner, tools
```

## 🛠️ Development

```bash
git clone https://github.com/luka-loehr/context-engine.git
cd context-engine
npm install
npm link  # Test locally
```

## 📄 License

MIT © [Luka Loehr](https://github.com/luka-loehr)

## 🔗 Links

- [GitHub](https://github.com/luka-loehr/context-engine)
- [Issues](https://github.com/luka-loehr/context-engine/issues)
- [XAI Platform](https://x.ai)
