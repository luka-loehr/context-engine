/**
 * Context Engine - Command Registry
 * Modular CLI command management
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

class CommandRegistry {
  constructor() {
    this.commands = new Map();
  }

  register(config) {
    const { name, handler, description } = config;
    
    if (!name || !handler) {
      throw new Error('Command registration requires name and handler');
    }

    this.commands.set(name, {
      name,
      handler,
      description: description || `Execute ${name} command`
    });
  }

  getCommand(name) {
    return this.commands.get(name);
  }

  async executeCommand(name, ...args) {
    const command = this.commands.get(name);
    if (!command) {
      throw new Error(`Unknown command: ${name}`);
    }
    return await command.handler(...args);
  }

  getAllCommands() {
    return Array.from(this.commands.values());
  }
}

export const commandRegistry = new CommandRegistry();
export { CommandRegistry };

