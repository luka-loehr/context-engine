import Anthropic from '@anthropic-ai/sdk';
import { BaseProvider } from './base.js';

export class AnthropicProvider extends BaseProvider {
  constructor(apiKey, modelId) {
    super(apiKey);
    this.client = new Anthropic({ apiKey });
    this.modelId = modelId;
  }

  async refinePrompt(messyPrompt, systemPrompt, onChunk) {
    // Claude Opus 4.1 has 32K max tokens, others have 64K
    const maxTokens = this.modelId === 'claude-opus-4-1' ? 32000 : 64000;
    
    const stream = await this.client.messages.create({
      model: this.modelId,
      messages: [{ role: 'user', content: messyPrompt }],
      system: systemPrompt,
      temperature: 0.3,
      max_tokens: maxTokens,
      stream: true
    });
    
    let refinedPrompt = '';
    
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
        const content = chunk.delta.text;
        if (onChunk) onChunk(content);
        refinedPrompt += content;
      }
    }
    
    return refinedPrompt;
  }
}

