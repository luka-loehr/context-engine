/**
 * Context Engine - Prompt Registry
 * Template-based prompt management system
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

class PromptRegistry {
  constructor() {
    this.prompts = new Map();
    this.templates = new Map();
  }

  registerPrompt(name, content, variables = []) {
    this.prompts.set(name, { content, variables });
  }

  registerTemplate(name, template, defaultValues = {}) {
    this.templates.set(name, { template, defaultValues });
  }

  getPrompt(name, values = {}) {
    const prompt = this.prompts.get(name);
    if (!prompt) return null;
    
    return this.interpolate(prompt.content, values);
  }

  getTemplate(name, values = {}) {
    const template = this.templates.get(name);
    if (!template) return null;
    
    const mergedValues = { ...template.defaultValues, ...values };
    return this.interpolate(template.template, mergedValues);
  }

  interpolate(text, values) {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return values[key] !== undefined ? values[key] : match;
    });
  }

  updatePrompt(name, updates) {
    const prompt = this.prompts.get(name);
    if (!prompt) return false;
    
    this.prompts.set(name, { ...prompt, ...updates });
    return true;
  }
}

export const promptRegistry = new PromptRegistry();
export { PromptRegistry };

// Register default system prompt
promptRegistry.registerPrompt('system', `You are an expert AI assistant helping developers understand and work with their codebase.

You have access to the project's files and structure. Use the available tools to:
- Read files to understand code
- Analyze dependencies and structure
- Answer questions about the codebase
- Suggest improvements

Be concise, accurate, and helpful.`);

// Register templates
promptRegistry.registerTemplate('fileAnalysis', 
  `Analyze {{filePath}} and provide insights about {{aspect}}.`,
  { aspect: 'structure and purpose' }
);

promptRegistry.registerTemplate('codeReview',
  `Review the code in {{filePath}} focusing on {{focusArea}}.`,
  { focusArea: 'best practices and potential issues' }
);

