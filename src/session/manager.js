/**
 * Context Engine - Session Manager
 * Handles session state, conversation history, and token tracking
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import { countTokens } from '../utils/tokenizer.js';

/**
 * Create a new chat session
 */
export function createSession(selectedModel, modelInfo, apiKey) {
  return {
    // Session metadata
    id: generateSessionId(),
    startTime: new Date(),

    // Model information
    selectedModel,
    modelInfo,
    apiKey,

    // Conversation state
    conversationHistory: [],
    initialContextMessages: [],

    // Token tracking
    baseTokens: 0,
    conversationTokens: 0,

    // UI state
    linesToClearBeforeNextMessage: 0,
    currentToolSpinner: null,
    thinkingSpinner: null,

    // Context
    fullProjectContext: null,

    // Safety
    readFiles: new Set()
  };
}

/**
 * Generate a unique session ID
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add user message to conversation history
 */
export function addUserMessage(session, message) {
  session.conversationHistory.push({
    role: 'user',
    content: message
  });

  // Update token count
  session.conversationTokens += countTokens(message);

  return session;
}

/**
 * Add assistant message to conversation history
 */
export function addAssistantMessage(session, message) {
  session.conversationHistory.push({
    role: 'assistant',
    content: message
  });

  // Update token count
  session.conversationTokens += countTokens(message);

  return session;
}

/**
 * Add initial context messages
 */
export function addInitialContext(session, contextMessages) {
  session.initialContextMessages = contextMessages;
  session.conversationHistory = [...contextMessages];

  // Calculate base tokens from initial context
  session.baseTokens = contextMessages.reduce((total, msg) => {
    return total + countTokens(msg.content);
  }, 0);

  return session;
}

/**
 * Clear conversation history while preserving initial context
 */
export function clearConversationHistory(session) {
  session.conversationHistory = [...session.initialContextMessages];
  session.conversationTokens = 0;
  return session;
}

/**
 * Get total token count for the session
 */
export function getTotalTokens(session) {
  return session.baseTokens + session.conversationTokens;
}

/**
 * Get conversation statistics
 */
export function getSessionStats(session) {
  return {
    messageCount: session.conversationHistory.length,
    conversationTokens: session.conversationTokens,
    baseTokens: session.baseTokens,
    totalTokens: getTotalTokens(session),
    duration: Date.now() - session.startTime.getTime()
  };
}

/**
 * Export session data for debugging
 */
export function exportSessionData(session) {
  return {
    id: session.id,
    stats: getSessionStats(session),
    history: session.conversationHistory.map(msg => ({
      role: msg.role,
      contentLength: msg.content.length,
      tokens: countTokens(msg.content)
    }))
  };
}
