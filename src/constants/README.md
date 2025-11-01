# Prompt Registry

Template-based prompt management with variable interpolation.

## Usage

```javascript
import { promptRegistry } from './prompt-registry.js';

// Get prompt
const prompt = promptRegistry.getPrompt('system');

// Get template with variables
const analysis = promptRegistry.getTemplate('fileAnalysis', {
  filePath: 'src/index.js',
  aspect: 'performance'
});
```

## Adding Prompts

```javascript
// Static prompt
promptRegistry.registerPrompt('myPrompt', 
  'This is the prompt content',
  ['var1', 'var2'] // optional variables
);

// Template with interpolation
promptRegistry.registerTemplate('myTemplate',
  'Analyze {{file}} for {{aspect}}',
  { aspect: 'default value' } // optional defaults
);
```

## Variable Interpolation

Use `{{variableName}}` syntax. Variables are replaced with provided values or left as-is.

## Updating Prompts

```javascript
promptRegistry.updatePrompt('myPrompt', {
  content: 'New content',
  variables: ['newVar']
});
```

## Key Points

- Prompts are immutable after registration unless updated
- Templates support default values
- Variable interpolation is simple string replacement
- Use for system prompts, templates, and reusable text

