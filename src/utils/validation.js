/**
 * API key validation utilities
 */

export function validateXAIKey(input) {
  if (!input || input.trim() === '') {
    return 'API key cannot be empty';
  }
  if (!input.startsWith('xai-')) {
    return 'Invalid API key format. XAI API keys start with "xai-"';
  }
  return true;
}

export function validatePrompt(input) {
  if (!input || input.trim() === '') {
    return 'Prompt cannot be empty';
  }
  return true;
}

