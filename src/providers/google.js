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
    
    // Start chat session for tool support
    const chat = model.startChat({ history: [] });
    
    // Send initial message
    const result = await chat.sendMessageStream(fullPrompt);
    let refinedPrompt = '';
    let functionCalls = [];
    
    // Process initial response
    for await (const chunk of result.stream) {
      const candidate = chunk.candidates?.[0];
      
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.functionCall) {
            functionCalls.push(part.functionCall);
          } else if (part.text) {
            if (onChunk) onChunk(part.text);
            refinedPrompt += part.text;
          }
        }
      }
    }
    
    // If there were function calls, execute them and continue
    if (functionCalls.length > 0 && onToolCall) {
      const functionResponses = [];
      
      for (const functionCall of functionCalls) {
        const toolResult = await onToolCall(functionCall.name, functionCall.args);
        functionResponses.push({
          functionResponse: {
            name: functionCall.name,
            response: toolResult
          }
        });
      }
      
      // Send function results back and get final response
      const followUpResult = await chat.sendMessageStream(functionResponses);
      
      for await (const chunk of followUpResult.stream) {
        const text = chunk.text();
        if (text) {
          if (onChunk) onChunk(text);
          refinedPrompt += text;
        }
      }
    }
    
    return refinedPrompt;
  }
}

