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

  async refinePrompt(messyPrompt, systemPrompt, onChunk) {
    const completionParams = {
      model: this.modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: messyPrompt }
      ],
      stream: true
    };
    
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
      if (chunk.choices[0]?.delta?.content) {
        const content = chunk.choices[0].delta.content;
        if (onChunk) onChunk(content);
        refinedPrompt += content;
      }
    }
    
    return refinedPrompt;
  }
}

