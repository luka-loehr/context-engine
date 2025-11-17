# context-engine

[![npm version](https://img.shields.io/npm/v/@lukaloehr/context-engine?style=flat&logo=npm&logoColor=white)](https://www.npmjs.com/package/@lukaloehr/context-engine)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D16.0.0-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat&logo=github&logoColor=white)](https://github.com/luka-loehr/context-engine)

**context-engine** is an interactive AI-powered codebase assistant using XAI Grok.  
Chat with your code and get instant answers about your entire project.

---

## ✨ Features

- 🚀 **Instant whole-folder structure preload** – Loads your entire codebase context automatically
- 🤖 **AI-powered context retrieval** – Reads exactly what it needs, when it needs it
- 📂 **Multi-file analysis** – Intelligent file selection and cross-file understanding
- 🔍 **Real-time code understanding** – Ask anything from architecture to implementation
- 🛠️ **Terminal command execution** – Run git commands and system operations
- 🎨 **Beautiful CLI** – Syntax highlighting, streaming responses, and intuitive interface

---

## 📦 Installation

```bash
npm install -g @lukaloehr/context-engine
```

---

## 🚀 Quick Start

1. **Set your XAI API key:**
   ```bash
   export XAI_API_KEY="xai-your_key_here"
   ```

2. **Start chatting with your codebase:**
   ```bash
   cd your-project
   context
   ```

3. **Or use test mode for quick queries:**
   ```bash
   context test "what does this project do?"
   ```

---

## 💡 Usage

### Interactive Mode
Start an interactive chat session in your project directory:
```bash
context
```

### Single Message Mode
Get a quick answer without entering interactive mode:
```bash
context test "your question here"
```

### Commands
- `/exit` – Exit the chat session
- `/clear` – Clear conversation history
- `/model` – Switch AI model
- `/api` – Manage API keys

---

## 🔧 Configuration

context-engine stores configuration in `~/.config/context-engine/`.

You can also use a local `.env` file:
```env
XAI_API_KEY=xai-your_key_here
```

Import keys from `.env` using `/api` command in interactive mode.

---

## 🏗️ Architecture

- **Modular subagent system** – Auto-discoverable agents with specialized capabilities
- **Context-based tool registry** – Tools organized by access level (main, subagent, shared)
- **Streaming responses** – Real-time output with syntax highlighting
- **Smart file reading** – Only reads files when needed, with visual feedback

---

## 📜 License

[MIT License](LICENSE)

---

## 🛠 Support

- 🐞 [Report bugs](https://github.com/luka-loehr/context-engine/issues)
- ✉️ Questions: [contact@lukaloehr.de](mailto:contact@lukaloehr.de)

---

Developed by [Luka Löhr](https://github.com/luka-loehr)  
Powered by [XAI Grok](https://x.ai)

