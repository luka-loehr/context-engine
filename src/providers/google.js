import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseProvider } from './base.js';

export class GoogleProvider extends BaseProvider {
  constructor(apiKey, modelId) {
    super(apiKey);
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelId = modelId;
  }

  async refinePrompt(messyPrompt, systemPrompt, onChunk, tools = null, onToolCall = null) {
    // Configure model with or without tools
    const modelConfig = { model: this.modelId };
    if (tools) {
      modelConfig.tools = [{ functionDeclarations: tools }];
    }
    
    const model = this.genAI.getGenerativeModel(modelConfig);
    
    // Combine system prompt and user prompt for Google AI
    const fullPrompt = `${systemPrompt}\n\nUser Prompt: ${messyPrompt}`;
    
    const result = await model.generateContentStream(fullPrompt);
    let refinedPrompt = '';
    
    for await (const chunk of result.stream) {
      // Check for function calls
      const functionCall = chunk.functionCalls?.()?.[0];
      if (functionCall && onToolCall) {
        const toolResult = await onToolCall(functionCall.name, functionCall.args);
        // Tool results will be handled by the caller
        continue;
      }
      
      const text = chunk.text();
      if (text) {
        if (onChunk) onChunk(text);
        refinedPrompt += text;
      }
    }
    
    return refinedPrompt;
  }
}

