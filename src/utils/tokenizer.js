import { encode } from 'gpt-tokenizer';

/**
 * Calculate total tokens from project files
 */
export function calculateTokens(projectContext) {
  if (!projectContext || projectContext.length === 0) {
    return 0;
  }
  
  let totalTokens = 0;
  
  for (const file of projectContext) {
    try {
      // Encode the file content to count tokens
      const tokens = encode(file.content);
      totalTokens += tokens.length;
    } catch (error) {
      // Skip files that can't be tokenized
      continue;
    }
  }
  
  return totalTokens;
}

/**
 * Calculate tokens from a string
 */
export function countTokens(text) {
  if (!text) return 0;
  
  try {
    const tokens = encode(text);
    return tokens.length;
  } catch (error) {
    return 0;
  }
}

/**
 * Format numbers with k/M suffix for nice display
 * Examples: 100, 1.2k, 10k, 100k, 1.5M
 */
export function formatTokenCount(count) {
  if (count < 1000) {
    return count.toString();
  } else if (count < 10000) {
    // 1.2k, 9.8k
    return (count / 1000).toFixed(1) + 'k';
  } else if (count < 1000000) {
    // 10k, 100k
    return Math.floor(count / 1000) + 'k';
  } else if (count < 10000000) {
    // 1.2M, 9.8M
    return (count / 1000000).toFixed(1) + 'M';
  } else {
    // 10M, 100M
    return Math.floor(count / 1000000) + 'M';
  }
}

/**
 * Calculate context usage percentage
 */
export function calculateContextPercentage(usedTokens, totalLimit) {
  if (totalLimit === 0) return 0;
  const percentage = (usedTokens / totalLimit) * 100;
  return Math.min(100, Math.round(percentage));
}

/**
 * Format context percentage with color coding
 */
export function formatContextUsage(percentage) {
  return `${percentage}%`;
}

