import fs from 'fs';
import path from 'path';
import { IGNORE_PATTERNS, VALID_EXTENSIONS, SKIP_CONFIG_FILES, MAX_FILE_SIZE } from '../constants/patterns.js';

/**
 * Recursively scan directory and collect file contents
 */
export async function scanDirectory(dir, baseDir = dir) {
  const files = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);
      
      // Skip ignored patterns
      if (IGNORE_PATTERNS.some(pattern => relativePath.includes(pattern) || entry.name.includes(pattern))) {
        continue;
      }
      
      // Skip specific config files that aren't useful
      if (entry.name.match(SKIP_CONFIG_FILES)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await scanDirectory(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        
        // Only include valid file extensions
        if (VALID_EXTENSIONS.includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Skip very large files
            if (content.length < MAX_FILE_SIZE) {
              files.push({
                path: relativePath,
                content: content
              });
            }
          } catch (err) {
            // Skip files that can't be read
            continue;
          }
        }
      }
    }
  } catch (err) {
    // Skip directories that can't be scanned
    return files;
  }
  
  return files;
}

/**
 * Get total character count from files
 */
export function getTotalCharacterCount(files) {
  return files.reduce((sum, f) => sum + f.content.length, 0);
}

