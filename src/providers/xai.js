/**
 * Context Engine - XAI Provider
 * XAI Grok API integration using OpenAI-compatible interface
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

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

  async refinePrompt(userPrompt, systemPrompt, onChunk, tools = null, onToolCall = null) {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
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
        // Tools can be in two formats:
        // 1. Raw format: {name, description, parameters}
        // 2. OpenAI format: {type: 'function', function: {name, description, parameters}}
        completionParams.tools = tools.map(tool => {
          // If already in OpenAI format, use as-is
          if (tool.type === 'function' && tool.function) {
            return tool;
          }
          // Otherwise, convert to OpenAI format
          return {
            type: 'function',
            function: {
              name: tool.name,
              description: tool.description,
              parameters: tool.parameters
            }
          };
        });
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
    let toolExecutionResults = new Map(); // Track executed tool results

    for await (const chunk of stream) {
      // Check for tool calls
      const toolCalls = chunk.choices[0]?.delta?.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        for (const toolCall of toolCalls) {
          const index = toolCall.index;

          // Check if we moved to a new tool call index - if so, the previous one might be ready to execute
          // Note: This works if tools come sequentially or if we can parse the JSON
          // Since OpenAI streams deltas, we only know a tool is "done" when:
          // 1. A new index appears (for sequential tools)
          // 2. The stream ends (handled after loop)
          
          // Actually, we can try to execute "eagerly" if we detect a new index
          // But we need to be careful not to execute partially. 
          // Let's rely on the fact that OpenAI usually finishes one tool before starting the next in the stream.
          // We can track the "active" index.
          
          if (!toolCallMap.has(index)) {
            // New tool started. Check if we have a previous tool that is complete?
            // This is tricky with parallel tools as they might interleave (though usually they don't).
            // Let's keep it simple: accumulate all, but if we see a tool call is "complete" (valid JSON), we could execute it?
            // No, because we need the arguments to be fully complete.
            
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
          
          // EAGER EXECUTION LOGIC:
          // Attempt to parse JSON arguments. If valid and looks complete, we *could* execute.
          // But "valid JSON" doesn't mean "complete JSON".
          // Instead, let's look for when the *next* tool starts (index changes).
          // When we see index N, check if index N-1 exists and hasn't been executed.
          if (index > 0 && toolCallMap.has(index - 1) && !toolExecutionResults.has(index - 1)) {
             // Previous tool seems done (since we moved to next index)
             // Execute it!
             await this.executeToolEagerly(toolCallMap.get(index - 1), index - 1, toolExecutionResults, onToolCall);
          }
        }
      }

      if (chunk.choices[0]?.delta?.content) {
        const content = chunk.choices[0].delta.content;
        currentContent += content;
        if (onChunk) onChunk(content); 
      }
    }
    
    // Stream ended. Execute any remaining tools (including the last one)
    for (const [index, toolCall] of toolCallMap.entries()) {
      if (!toolExecutionResults.has(index)) {
         await this.executeToolEagerly(toolCall, index, toolExecutionResults, onToolCall);
      }
    }

    // Convert tool call map to array
    currentToolCalls = Array.from(toolCallMap.values()).filter(call =>
      call.id && call.function.name && call.function.arguments
    );

    // If there were tool calls, execute them and continue
    if (currentToolCalls.length > 0 && onToolCall) {
      // Add assistant message with tool calls
      messages.push({
        role: 'assistant',
        content: currentContent || null,
        tool_calls: currentToolCalls
      });

      // Collect results (some might already be executed eagerly)
      let shouldStopLoop = false;
      
      // Wait for all tool executions to complete (they should be done or promises)
      // Actually, executeToolEagerly returns a promise or value.
      
      for (const toolCall of currentToolCalls) {
        // Find the index for this tool call
        // We need to map back from the toolCall object to its index or just use the map iteration order
        // But currentToolCalls is from values().
        // Let's iterate the map to get results in order.
      }
      
      // Re-iterate map to match toolCalls with results
      for (const [index, toolCall] of toolCallMap.entries()) {
         if (!toolCall.id || !toolCall.function.name || !toolCall.function.arguments) continue;

         // Get the result (await it if it's a promise)
         const toolResult = await toolExecutionResults.get(index);
         
         if (toolResult && toolResult.stopLoop) {
           shouldStopLoop = true;
         }

         messages.push({
           role: 'tool',
           tool_call_id: toolCall.id,
           content: JSON.stringify(toolResult)
         });
      }
      
      if (shouldStopLoop) {
        continueLoop = false;
      } else {
        refinedPrompt += currentContent;
      }
    } else {
      refinedPrompt += currentContent;
      continueLoop = false;
    }
  }
  
  return refinedPrompt;
}

/**
 * Helper to execute tool eagerly
 */
  async executeToolEagerly(toolCall, index, resultsMap, onToolCall) {
    try {
       const args = JSON.parse(toolCall.function.arguments);
       // Execute immediately for side effects (UI updates)
       // We store the promise in the map
       const promise = onToolCall(toolCall.function.name, args);
       resultsMap.set(index, promise);
       return promise;
    } catch (e) {
       // JSON parse error likely means incomplete args, which shouldn't happen if we wait for index change
       // But if it does, we handle it later in the final loop
       console.error("Eager execution failed (likely incomplete JSON):", e.message);
       resultsMap.set(index, { error: e.message }); 
    }
  }
}

