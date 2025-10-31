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
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: messyPrompt }
    ];
    
    let refinedPrompt = '';
    let continueLoop = true;
    
    // Loop until AI is done (no more tool calls)
    while (continueLoop) {
      const completionParams = {
        model: this.modelId,
        messages: messages,
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
      let currentToolCalls = [];
      let currentContent = '';
      let toolCallMap = new Map(); // Track tool calls by index
      let contentChunks = []; // Buffer content chunks

      for await (const chunk of stream) {
        // Check for tool calls
        const toolCalls = chunk.choices[0]?.delta?.tool_calls;
        if (toolCalls && toolCalls.length > 0) {
          for (const toolCall of toolCalls) {
            const index = toolCall.index;
            if (!toolCallMap.has(index)) {
              toolCallMap.set(index, {
                id: toolCall.id,
                type: 'function',
                function: {
                  name: '',
                  arguments: ''
                }
              });
            }

            const existingCall = toolCallMap.get(index);

            // Update ID if present (only in first chunk)
            if (toolCall.id) {
              existingCall.id = toolCall.id;
            }

            // Accumulate function data
            if (toolCall.function) {
              if (toolCall.function.name) {
                existingCall.function.name += toolCall.function.name;
              }
              if (toolCall.function.arguments) {
                existingCall.function.arguments += toolCall.function.arguments;
              }
            }
          }
        }
        
        if (chunk.choices[0]?.delta?.content) {
          const content = chunk.choices[0].delta.content;
          currentContent += content;
          contentChunks.push(content);
          // Don't output yet - wait to see if we have tool calls
        }
      }

      // Convert tool call map to array, filtering out incomplete tool calls
      currentToolCalls = Array.from(toolCallMap.values()).filter(call =>
        call.id && call.function.name && call.function.arguments
      );
      
      // If there were tool calls, execute them and continue
      if (currentToolCalls.length > 0 && onToolCall) {
        // Add assistant message with tool calls
        // XAI API requires content to be null (not empty string) when only tool_calls are present
        messages.push({
          role: 'assistant',
          content: currentContent || null,
          tool_calls: currentToolCalls
        });
        
        // Execute tools concurrently
        let shouldStopLoop = false;
        const toolPromises = currentToolCalls.map(async (toolCall) => {
          const args = JSON.parse(toolCall.function.arguments);
          const toolResult = await onToolCall(toolCall.function.name, args);
          return { toolCall, toolResult };
        });
        
        // Wait for all tools to complete
        const toolResults = await Promise.all(toolPromises);
        
        // Add tool responses to messages
        for (const { toolCall, toolResult } of toolResults) {
          // Check if tool wants to stop the loop
          if (toolResult && toolResult.stopLoop) {
            shouldStopLoop = true;
          }
          
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult)
          });
        }
        
        // If any tool requested to stop, exit the loop without outputting content
        if (shouldStopLoop) {
          continueLoop = false;
        } else {
          // Output buffered content chunks and add to refined prompt
          if (onChunk && contentChunks.length > 0) {
            for (const chunk of contentChunks) {
              onChunk(chunk);
            }
          }
          refinedPrompt += currentContent;
        }
      } else {
        // No tool calls - output buffered content and we're done
        if (onChunk && contentChunks.length > 0) {
          for (const chunk of contentChunks) {
            onChunk(chunk);
          }
        }
        refinedPrompt += currentContent;
        continueLoop = false;
      }
    }
    
    return refinedPrompt;
  }
}

