import OpenAI from 'openai';
import { BaseProvider } from './base.js';

export class XAIProvider extends BaseProvider {
  constructor(apiKey, modelId) {
    super(apiKey);
    this.client = new OpenAI({ 
      apiKey,
      baseURL: 'https://api.x.ai/v1'
    });
    this.modelId = modelId;
  }

  async refinePrompt(messyPrompt, systemPrompt, onChunk, tools = null, onToolCall = null) {
    const completionParams = {
      model: this.modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: messyPrompt }
      ],
      stream: true
    };
    
    // Add tools if provided
    if (tools) {
      completionParams.tools = tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }
      }));
    }
    
    // Grok 4 Fast Reasoning is a reasoning model - no temperature/frequency/presence penalties
    // Other Grok models support standard parameters
    if (this.modelId === 'grok-4-fast-reasoning') {
      // Reasoning model
      completionParams.max_tokens = 100000; // Max 100k tokens for Grok models
    } else {
      // Standard models
      completionParams.temperature = 0.3;
      completionParams.max_tokens = 2000;
    }
    
    const stream = await this.client.chat.completions.create(completionParams);
    let refinedPrompt = '';
    
    for await (const chunk of stream) {
      // Check for tool calls
      const toolCalls = chunk.choices[0]?.delta?.tool_calls;
      if (toolCalls && toolCalls.length > 0 && onToolCall) {
        for (const toolCall of toolCalls) {
          if (toolCall.function) {
            const args = JSON.parse(toolCall.function.arguments || '{}');
            await onToolCall(toolCall.function.name, args);
          }
        }
        continue;
      }
      
      if (chunk.choices[0]?.delta?.content) {
        const content = chunk.choices[0].delta.content;
        if (onChunk) onChunk(content);
        refinedPrompt += content;
      }
    }
    
    return refinedPrompt;
  }
}

