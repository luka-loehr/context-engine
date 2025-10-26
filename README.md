<div align="center">

# promptx

[![npm version](https://img.shields.io/npm/v/@lukaloehr/promptx.svg)](https://www.npmjs.com/package/@lukaloehr/promptx)
[![npm downloads](https://img.shields.io/npm/dm/@lukaloehr/promptx.svg)](https://www.npmjs.com/package/@lukaloehr/promptx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Transform messy prompts into structured, clear prompts for AI agents**

Supports the latest AI models: GPT-5, Claude 4.5, Grok 4 Fast, Gemini 2.5

</div>

---

## 🚀 Quick Start

```bash
npm install -g @lukaloehr/promptx
```

Then run:
```bash
promptx
```

First run will guide you through setup (choose provider, model, enter API key).

---

## 🤖 Supported AI Models

### OpenAI
- **GPT-5** (74.9% SWE-bench) - Best coding performance
- **GPT-5 Mini** (71%, 2× faster) - Balanced speed & quality
- **GPT-5 Nano** (Fastest, cheapest) - High throughput

### Anthropic Claude 4.5
- **Claude Sonnet 4.5** - Top coding, 1M context
- **Claude Haiku 4.5** - Fastest, 1/3 cost
- **Claude Opus 4.1** - Deepest reasoning (74.5%)

### xAI Grok
- **Grok Code Fast 1** - Coding specialist (70.8%)
- **Grok 4 Fast Reasoning** - 2M context, deep thinking
- **Grok 4 Fast Non-Reasoning** - Fastest responses

### Google Gemini 2.5
- **Gemini 2.5 Pro** - Best reasoning, 1M context
- **Gemini Flash Latest** - Best price/performance
- **Gemini Flash Lite Latest** - Fastest, lowest cost

### Ollama (Local)
- Run models offline with no API keys
- Recommended: Llama 3 (8B), Mistral (7B), Code Llama

---

## 💻 Usage

**Interactive mode:**
```bash
promptx
```

**Direct mode:**
```bash
promptx "your messy prompt here"
```

**Pro mode (with full project context):**
```bash
promptx --pro "improve the homepage"
```

The `--pro` flag:
- 🔍 Scans all files in your project directory
- 📊 Shows file list and asks for confirmation
- 🎯 Creates context-aware prompts specific to your codebase
- 🔒 Respects .gitignore and skips sensitive files

**Commands:**
- `promptx /help` - Show help
- `promptx /model` - Switch models
- `promptx reset` - Reset configuration

---

## 📋 Requirements

- Node.js >= 16.0.0
- API key from your chosen provider:
  - [OpenAI](https://platform.openai.com/api-keys)
  - [Anthropic](https://console.anthropic.com/settings/keys)
  - [xAI](https://console.x.ai/)
  - [Google](https://aistudio.google.com/apikey)
  - [Ollama](https://ollama.ai) (no key needed)

---

## ✨ Example

**Before:**
```
make a function that sorts array but also handle edge cases like null undefined etc
```

**After:**
```
Create a JavaScript function that sorts an array with the following requirements:

1. Function should accept an array as input parameter
2. Handle edge cases including:
   - null or undefined input
   - empty arrays
   - arrays containing null/undefined values
   - mixed data types (numbers, strings, objects)
3. Return a new sorted array without modifying the original
4. Use a stable sorting algorithm
5. For mixed types, sort by: numbers first (ascending), 
   then strings (alphabetical), then other types
6. Document the function with JSDoc comments
7. Include parameter validation and appropriate error handling
```

---

## 🛠️ Troubleshooting

**Command not found?**
```bash
# Make sure you installed globally with -g flag
npm install -g @lukaloehr/promptx
```

**Invalid API key?**
```bash
promptx reset
```

**Update to latest version:**
```bash
npm install -g @lukaloehr/promptx@latest
```

---

<div align="center">

**Made with ❤️ by [Luka Loehr](https://github.com/luka-loehr)**

[⭐ Star on GitHub](https://github.com/luka-loehr/promptx-cli) • [🐛 Report Bug](https://github.com/luka-loehr/promptx-cli/issues) • [💡 Request Feature](https://github.com/luka-loehr/promptx-cli/issues)

</div>
