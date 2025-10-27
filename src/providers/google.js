import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseProvider } from './base.js';

export class GoogleProvider extends BaseProvider {
  constructor(apiKey, modelId) {
    super(apiKey);
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelId = modelId;
  }

  async refinePrompt(messyPrompt, systemPrompt, onChunk) {
    const model = this.genAI.getGenerativeModel({ model: this.modelId });
    
    // Combine system prompt and user prompt for Google AI
    const fullPrompt = `${systemPrompt}\n\nUser Prompt: ${messyPrompt}`;
    
    const result = await model.generateContentStream(fullPrompt);
    let refinedPrompt = '';
    
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        if (onChunk) onChunk(text);
        refinedPrompt += text;
      }
    }
    
    return refinedPrompt;
  }
}

