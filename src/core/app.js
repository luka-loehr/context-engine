/**
 * Context Engine - Core App Logic
 * Handles initialization, update checking, and main app flow
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import updateNotifier from 'update-notifier';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { setupCLI, registerCommands, parseCLI } from '../cli/index.js';
import { showUpdateNotification } from '../ui/output.js';

/**
 * Get package information
 */
function getPackageInfo() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
  );
  return packageJson;
}

/**
 * Check for application updates
 */
export function createUpdateNotifier() {
  const packageJson = getPackageInfo();
  return updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 1000 * 60 * 60 * 24 // Check once per day
  });
}

/**
 * Initialize the application
 */
export function initializeApp() {
  // Check for updates
  const notifier = createUpdateNotifier();
  showUpdateNotification(notifier);

  // Setup CLI
  const program = setupCLI();

  return { program, notifier };
}

/**
 * Register all command handlers
 */
export function setupCommandHandlers(program) {
  // Import handlers dynamically to avoid circular dependencies
  const handlers = {
    clearConfig: async () => {
      const { clearConfig } = await import('../config/config.js');
      return clearConfig();
    },
    changeModel: async () => {
      const { changeModel } = await import('../commands/model.js');
      return changeModel();
    },
    getOrSetupConfig: async () => {
      const { getOrSetupConfig } = await import('../config/config.js');
      return getOrSetupConfig();
    },
    getProjectContext: async (dir) => {
      const { getProjectContext } = await import('../commands/refine.js');
      return getProjectContext(dir);
    },
    startChatSession: async (selectedModel, modelInfo, apiKey, projectContext, singleMessage = null) => {
      const { startChatSession } = await import('../commands/chat.js');
      return startChatSession(selectedModel, modelInfo, apiKey, projectContext, singleMessage);
    }
  };

  return registerCommands(program, handlers);
}

/**
 * Start the application
 */
export async function startApp() {
  const { program } = initializeApp();
  const programWithCommands = await setupCommandHandlers(program);
  parseCLI(programWithCommands);
}
