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
    let currentMessage = fullPrompt;
    let refinedPrompt = '';
    let continueLoop = true;
    
    // Loop until AI is done (no more function calls)
    while (continueLoop) {
      const result = await chat.sendMessageStream(currentMessage);
      let functionCalls = [];
      
      // Process response
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
      
      // If there were function calls, execute them and continue loop
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
        
        // Set function responses as next message
        currentMessage = functionResponses;
      } else {
        // No more function calls, we're done
        continueLoop = false;
      }
    }
    
    return refinedPrompt;
  }
}

