// src/utils/validators.ts

/**
 * Parse string to positive integer (> 0).
 * Throws an Error with a nice message when invalid.
 */
export function parsePositiveInt(value: string): number {
  const n = Number(value);
  
  // Check for missing/empty value
  if (!value) {
    throw new Error('Missing or invalid numeric parameter (width or height)');
  }
  
  // Check for scientific notation (contains 'e' or 'E')
  if (/[eE]/.test(value)) {
    throw new Error('Missing or invalid numeric parameter (width or height)');
  }
  
  // Check for NaN or non-finite numbers (including Infinity, -Infinity)
  if (Number.isNaN(n) || !Number.isFinite(n)) {
    throw new Error('Missing or invalid numeric parameter (width or height)');
  }
  
  const intN = Math.trunc(n);
  if (intN <= 0) {
    throw new Error('width and height must be positive integers greater than zero');
  }
  
  return intN;
}