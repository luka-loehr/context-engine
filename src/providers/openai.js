import OpenAI from 'openai';
import { BaseProvider } from './base.js';

export class OpenAIProvider extends BaseProvider {
  constructor(apiKey, modelId) {
    super(apiKey);
    this.client = new OpenAI({ apiKey });
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
    
    // GPT-5 models use max_completion_tokens and don't support custom temperature
    if (this.modelId.startsWith('gpt-5')) {
      completionParams.max_completion_tokens = 2000;
      // GPT-5 only supports default temperature (1)
    } else {
      completionParams.max_tokens = 2000;
      completionParams.temperature = 0.3;
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

