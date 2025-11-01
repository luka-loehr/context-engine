# AI Provider System

The Provider System manages AI model integrations. Currently supports XAI (Grok), with architecture ready for additional providers.

## Current Architecture

```
src/providers/
├── base.js        # BaseProvider abstract class
├── xai.js         # XAI (Grok) provider implementation
└── index.js       # Provider factory
```

## How It Works

### 1. Base Provider Class

All providers extend `BaseProvider`:

```javascript
export class BaseProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async refinePrompt(messyPrompt, systemPrompt, onChunk, tools, onToolCall) {
    throw new Error('refinePrompt must be implemented by provider');
  }

  getConfig() {
    return {};
  }
}
```

### 2. Provider Implementation

Example: XAI Provider

```javascript
import { BaseProvider } from './base.js';
import OpenAI from 'openai';

export class XAIProvider extends BaseProvider {
  constructor(apiKey, modelId) {
    super(apiKey);
    this.client = new OpenAI({ 
      apiKey,
      baseURL: 'https://api.x.ai/v1'
    });
    this.modelId = modelId;
  }

  async refinePrompt(messyPrompt, systemPrompt, onChunk, tools, onToolCall) {
    // Implementation using OpenAI SDK
    // Handles streaming, tool calls, etc.
  }
}
```

### 3. Provider Factory

```javascript
export function createProvider(provider, apiKey, modelId) {
  switch (provider) {
    case 'xai':
      return new XAIProvider(apiKey, modelId);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
```

## Adding a New Provider

### Step 1: Create Provider Class

Create `src/providers/openai.js`:

```javascript
import { BaseProvider } from './base.js';
import OpenAI from 'openai';

export class OpenAIProvider extends BaseProvider {
  constructor(apiKey, modelId) {
    super(apiKey);
    this.client = new OpenAI({ apiKey });
    this.modelId = modelId;
  }

  async refinePrompt(messyPrompt, systemPrompt, onChunk, tools, onToolCall) {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: messyPrompt }
    ];

    let refinedPrompt = '';
    let continueLoop = true;

    while (continueLoop) {
      const completionParams = {
        model: this.modelId,
        messages,
        stream: true,
        tools: tools?.length > 0 ? tools : undefined
      };

      const stream = await this.client.chat.completions.create(completionParams);

      let currentContent = '';
      let currentToolCalls = [];

      // Handle streaming response
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        if (delta?.content) {
          currentContent += delta.content;
          if (onChunk) {
            onChunk(delta.content);
          }
        }

        if (delta?.tool_calls) {
          // Collect tool calls
          // (Implementation details...)
        }
      }

      // Handle tool calls if present
      if (currentToolCalls.length > 0 && onToolCall) {
        // Execute tools
        // (Implementation details...)
      } else {
        refinedPrompt += currentContent;
        continueLoop = false;
      }
    }

    return refinedPrompt;
  }

  getConfig() {
    return {
      supportsStreaming: true,
      supportsToolCalls: true,
      maxTokens: 128000
    };
  }
}
```

### Step 2: Update Factory

Edit `src/providers/index.js`:

```javascript
import { XAIProvider } from './xai.js';
import { OpenAIProvider } from './openai.js';

export function createProvider(provider, apiKey, modelId) {
  switch (provider) {
    case 'xai':
      return new XAIProvider(apiKey, modelId);
    case 'openai':
      return new OpenAIProvider(apiKey, modelId);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
```

### Step 3: Add Model Definitions

Edit `src/constants/models.js`:

```javascript
export const AVAILABLE_MODELS = [
  // Existing XAI models...
  {
    name: 'GPT-4 Turbo',
    model: 'gpt-4-turbo-preview',
    provider: 'openai',
    description: 'OpenAI GPT-4 Turbo'
  },
  {
    name: 'GPT-3.5 Turbo',
    model: 'gpt-3.5-turbo',
    provider: 'openai',
    description: 'OpenAI GPT-3.5 Turbo'
  }
];
```

### Step 4: Update Configuration

The config system needs to support the new provider's API key:

Edit `src/commands/chat.js` to handle OpenAI keys:

```javascript
// Check for API key
let apiKey;
if (currentModelInfo.provider === 'openai') {
  apiKey = getConfig('openai_api_key') || process.env.OPENAI_API_KEY;
} else {
  apiKey = getConfig('xai_api_key') || process.env.XAI_API_KEY;
}
```

### Step 5: Done!

Your new provider is now available throughout Context Engine.

## Provider Requirements

### Must Implement

1. **`refinePrompt(messyPrompt, systemPrompt, onChunk, tools, onToolCall)`**
   - Handle streaming responses
   - Support tool/function calling
   - Return final refined prompt

2. **`getConfig()`**
   - Return provider capabilities
   - Optional, defaults to `{}`

### Parameters

- `messyPrompt`: User input or conversation
- `systemPrompt`: System instructions
- `onChunk`: Callback for streaming (can be null)
- `tools`: Array of available tools (can be null)
- `onToolCall`: Async callback for tool execution (can be null)

### Tool Call Format

Tools are provided in OpenAI function calling format:

```javascript
{
  name: 'toolName',
  description: 'What the tool does',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: '...' }
    },
    required: ['param1']
  }
}
```

### Tool Execution

When AI calls a tool:

```javascript
const result = await onToolCall(toolName, parameters);
// result: { success: boolean, ...data }
```

You must add the tool result back to the conversation and continue the loop.

## Advanced Features

### Custom Configuration

```javascript
getConfig() {
  return {
    supportsStreaming: true,
    supportsToolCalls: true,
    supportsImages: false,
    maxTokens: 128000,
    maxToolCalls: 10,
    customFeature: true
  };
}
```

### Error Handling

```javascript
async refinePrompt(...) {
  try {
    // Your implementation
  } catch (error) {
    if (error.code === 'insufficient_quota') {
      throw new Error('API quota exceeded. Check your billing.');
    }
    throw error; // Let global handler catch it
  }
}
```

### Rate Limiting

```javascript
constructor(apiKey, modelId) {
  super(apiKey);
  this.rateLimiter = new RateLimiter({
    tokensPerMinute: 10000,
    requestsPerMinute: 60
  });
}

async refinePrompt(...) {
  await this.rateLimiter.waitForToken();
  // Proceed with API call
}
```

## Provider Comparison

| Feature | XAI Grok | OpenAI | Anthropic | Local |
|---------|----------|--------|-----------|-------|
| Streaming | ✅ | ✅ | ✅ | ✅ |
| Tool Calls | ✅ | ✅ | ✅ | ⚠️ |
| Cost | $$ | $$$ | $$ | Free |
| Speed | Fast | Fast | Medium | Varies |
| Setup | API Key | API Key | API Key | Local Model |

## Future: Provider Registry

**Goal:** Make provider system fully modular like tools and subagents.

### Planned Architecture

```
src/providers/
├── core/
│   ├── base.js
│   └── registry.js       # NEW: Provider registry
├── providers/
│   ├── xai.js
│   ├── openai.js
│   └── anthropic.js
├── index.js
└── README.md
```

### Registry Usage (Future)

```javascript
// Register provider
providerRegistry.register({
  name: 'openai',
  displayName: 'OpenAI',
  providerClass: OpenAIProvider,
  models: [
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
  ],
  envVar: 'OPENAI_API_KEY',
  configKey: 'openai_api_key'
});

// Auto-discovery
providerRegistry.discoverProviders('./providers/');

// Usage
const provider = providerRegistry.createProvider('openai', apiKey, modelId);
```

## Testing

### Unit Test

```javascript
import { MyProvider } from './my-provider.js';

test('provider handles streaming', async () => {
  const provider = new MyProvider('test-key', 'test-model');
  
  let chunks = [];
  const onChunk = (chunk) => chunks.push(chunk);
  
  const result = await provider.refinePrompt(
    'Hello',
    'You are helpful',
    onChunk
  );
  
  expect(chunks.length).toBeGreaterThan(0);
  expect(result).toContain('Hello');
});
```

### Integration Test

```javascript
test('provider handles tool calls', async () => {
  const provider = new MyProvider('test-key', 'test-model');
  
  const tools = [{ name: 'test', description: 'Test tool', parameters: {} }];
  const onToolCall = async (name, params) => ({ success: true, result: 'ok' });
  
  const result = await provider.refinePrompt(
    'Use the test tool',
    'You are helpful',
    null,
    tools,
    onToolCall
  );
  
  expect(result).toBeDefined();
});
```

## Best Practices

### ✅ DO
- Extend `BaseProvider`
- Handle streaming gracefully
- Support tool calls if possible
- Provide clear error messages
- Implement retry logic for transient failures
- Respect rate limits

### ❌ DON'T
- Hardcode API endpoints
- Ignore tool call loops
- Skip error handling
- Block on network calls without timeout
- Log API keys or sensitive data

## Troubleshooting

### Common Issues

**1. API Key Not Found**
```javascript
// Solution: Check config and environment
const apiKey = getConfig('my_provider_api_key') || process.env.MY_PROVIDER_API_KEY;
if (!apiKey) {
  throw new Error('API key not found. Set MY_PROVIDER_API_KEY environment variable.');
}
```

**2. Streaming Not Working**
```javascript
// Solution: Ensure proper async iteration
for await (const chunk of stream) {
  // Process chunk
}
```

**3. Tool Calls Hanging**
```javascript
// Solution: Always continue the loop after tool execution
if (toolCalls.length > 0) {
  await executeTools(toolCalls);
  continueLoop = true; // Continue conversation
} else {
  continueLoop = false; // End conversation
}
```

## Contributing

To add a new provider:

1. Fork the repository
2. Create provider class in `src/providers/`
3. Update factory in `index.js`
4. Add models to `constants/models.js`
5. Add tests
6. Update this README
7. Submit PR

---

*For questions or issues, open an issue on [GitHub](https://github.com/luka-loehr/context-engine)*

