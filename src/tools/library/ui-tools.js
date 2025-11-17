/**
 * Context Engine - UI Tools
 * Tools for updating status, showing progress, and user interaction
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

export const uiTools = [
  {
    name: 'statusUpdate',
    category: 'ui',
    description: 'Update the status message shown to the user. Use frequently to keep users informed of progress',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'A concise status message (1-10 words) describing current activity'
        }
      },
      required: ['status']
    },
    handler: async (parameters, context) => {
      const { status } = parameters;
      const { spinner, subAgentName } = context;

      // Update the loading spinner with the status message
      if (spinner && spinner.isSpinning) {
        spinner.text = status;
      } else {
        // If spinner is not running, log to console
        console.log(`📝 ${subAgentName || 'Agent'}: ${status}`);
      }

      return {
        success: true,
        message: `Status updated: ${status}`
      };
    }
  }
];

