# Provider Registry

Registry for AI model providers (XAI, OpenAI, Anthropic, etc).

## Adding a Provider

```javascript
// In src/providers/myprovider.js
import { BaseProvider } from './base.js';

export class MyProvider extends BaseProvider {
  constructor(apiKey, modelId) {
    super(apiKey);
    this.client = createClient(apiKey);
    this.modelId = modelId;
  }

  async refinePrompt(userPrompt, systemPrompt, onChunk, tools, onToolCall) {
    // Implement streaming + tool calling
    // Return final response
  }
}
```

## Registration

```javascript
// In src/providers/index.js
providerRegistry.register({
  id: 'myprovider',
  name: 'My Provider',
  providerClass: MyProvider,
  models: [
    { name: 'Model Name', model: 'model-id', description: '...' }
  ],
  envVar: 'MY_PROVIDER_API_KEY',
  configKey: 'myprovider_api_key'
});
```

## Requirements

Must implement:
- `refinePrompt(userPrompt, systemPrompt, onChunk, tools, onToolCall)`
- Handle streaming via onChunk callback
- Handle tool calls via onToolCall callback
- Return final refined prompt string

## Tool Call Flow

1. AI requests tool
2. Call `await onToolCall(toolName, parameters)`
3. Add tool result to conversation
4. Continue loop until no more tools
5. Check `result.stopLoop` to exit early

## Registry Functions

- `createProvider(id, apiKey, modelId)` - Create instance
- `getAllModels()` - Get all models from all providers
- `getApiKey(providerId)` - Get API key from env/config

