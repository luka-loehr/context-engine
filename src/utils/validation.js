/**
 * API key validation utilities
 */

export function validateOpenAIKey(input) {
  if (!input || input.trim() === '') {
    return 'API key cannot be empty';
  }
  if (!input.startsWith('sk-')) {
    return 'Invalid API key format. OpenAI API keys start with "sk-"';
  }
  return true;
}

export function validateAnthropicKey(input) {
  if (!input || input.trim() === '') {
    return 'API key cannot be empty';
  }
  if (!input.startsWith('sk-ant-')) {
    return 'Invalid API key format. Anthropic API keys start with "sk-ant-"';
  }
  return true;
}

export function validateXAIKey(input) {
  if (!input || input.trim() === '') {
    return 'API key cannot be empty';
  }
  if (!input.startsWith('xai-')) {
    return 'Invalid API key format';
  }
  return true;
}

export function validateGoogleKey(input) {
  if (!input || input.trim() === '') {
    return 'API key cannot be empty';
  }
  return true;
}

export function validatePrompt(input) {
  if (!input || input.trim() === '') {
    return 'Prompt cannot be empty';
  }
  return true;
}

