/**
 * Context Engine - File Patterns
 * File patterns and extensions for project scanning and filtering
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

// Files and directories to ignore when scanning project
export const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.next',
  '.nuxt',
  'dist',
  'build',
  'out',
  '.cache',
  'coverage',
  '.DS_Store',
  '.env',
  '.env.local',
  '.env.production',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'pubspec.lock',
  '.log',
  '.tmp',
  '.temp',
  '.idea',
  '.vscode',
  '.dart_tool',
  '__pycache__',
  '.pytest_cache',
  'venv',
  '.venv',
  'target',
  'Pods',
  '.gradle'
];

// File extensions to include in project scanning
export const VALID_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
  '.py', '.java', '.go', '.rb', '.php', '.rs', '.swift',
  '.html', '.css', '.scss', '.sass', '.less',
  '.json', '.yaml', '.yml', '.toml', '.xml',
  '.md', '.txt', '.sql', '.sh', '.bash',
  '.c', '.cpp', '.h', '.hpp', '.cs',
  '.dart', '.kt', '.kts', '.gradle',
  '.m', '.mm', '.lua'
];

// Config files to skip
export const SKIP_CONFIG_FILES = /^(package_config|package_graph|deviceStreaming|workspace)\.(json|xml)$/;

// Maximum file size to include (100KB)
export const MAX_FILE_SIZE = 100000;

