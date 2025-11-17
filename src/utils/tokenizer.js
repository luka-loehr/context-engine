/**
 * Context Engine - Tokenizer
 * Token counting and text length utilities for AI models
 *
 * Copyright (c) 2025 Luka Loehr
 * Licensed under the MIT License
 */

import { encode } from 'gpt-tokenizer';

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