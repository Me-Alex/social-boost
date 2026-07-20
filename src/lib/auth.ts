/**
 * Authentication Utilities for SocialBoost
 * 
 * Provides password hashing, token generation, and verification functions.
 * Uses bcryptjs for secure password handling.
 */

import bcrypt from 'bcryptjs';

// Salt rounds for bcrypt (higher = more secure but slower)
const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt
 * @param password - The plaintext password to hash
 * @returns Promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plaintext password with a stored hash
 * @param password - The plaintext password to verify
 * @param hashedPassword - The stored bcrypt hash
 * @returns Promise resolving to true if passwords match
 */
export async function comparePassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a random session token
 * @param bytes - Number of bytes for the token (default 32)
 * @returns Hex-encoded random token string
 */
export function generateToken(bytes: number = 32): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a simple API key for programmatic access
 * @returns API key prefixed with 'sb_'
 */
export function generateApiKey(): string {
  const token = generateToken(24);
  return `sb_${token}`;
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid boolean and array of error messages
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Special character is optional but recommended
  // if (![^a-zA-Z0-9]/.test(password)) {
  //   errors.push('Password must contain at least one special character');
  // }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize user input to prevent XSS
 * @param input - String to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, maxLength: number = 500): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"'&\\]/g, '') // Remove HTML-special characters
    .replace(/\s+/g, ' '); // Collapse whitespace
}

/**
 * Validate email format more strictly
 * @param email - Email address to validate
 * @returns True if email appears valid
 */
export function isValidEmail(email: string): boolean {
  // More strict email regex that disallows most invalid formats
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Rate limit store type
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastAttempt?: number;
}

// In-memory rate limit store (for demo - use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check rate limit for an identifier
 * @param identifier - Unique identifier (IP + endpoint combo)
 * @param windowMs - Time window in milliseconds
 * @param maxAttempts - Maximum attempts allowed in window
 * @returns Object with allowed status and metadata
 */
export function checkRateLimit(
  identifier: string,
  windowMs: number = 60 * 1000,
  maxAttempts: number = 10
): { 
  allowed: boolean; 
  remaining: number; 
  resetTime: number;
  retryAfter?: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    // New window or expired entry
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
      lastAttempt: now
    });
    
    return { 
      allowed: true, 
      remaining: maxAttempts - 1, 
      resetTime: now + windowMs 
    };
  }
  
  // Within existing window
  if (entry.count >= maxAttempts) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    };
  }
  
  entry.count++;
  entry.lastAttempt = now;
  
  return { 
    allowed: true, 
    remaining: maxAttempts - entry.count, 
    resetTime: entry.resetTime 
  };
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

// ============================================================================
// URL VALIDATION & SANITIZATION
// ============================================================================

/**
 * Platform-specific URL validation patterns
 */
const PLATFORM_URL_PATTERNS: Record<string, RegExp> = {
  youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i,
  instagram: /^(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\/.+/i,
  tiktok: /^(https?:\/\/)?(www\.)?(tiktok\.com)\/.+/i,
  twitter: /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+/i,
  facebook: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.+/i,
};

/**
 * Validate URL against platform-specific patterns
 */
export function validatePlatformUrl(url: string, platform: string): boolean {
  try {
    // Basic URL format check
    new URL(url);
    
    const pattern = PLATFORM_URL_PATTERNS[platform];
    if (!pattern) return false;
    
    return pattern.test(url);
  } catch {
    return false;
  }
}

/**
 * Sanitize URL - remove tracking parameters and normalize
 */
export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url.trim());
    
    // Remove dangerous/tracking query params
    const dangerousParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', '_ga', 'ref', 'si', 'feature', 't'
    ];
    
    for (const param of dangerousParams) {
      urlObj.searchParams.delete(param);
    }
    
    // Force HTTPS for known platforms
    if (urlObj.protocol === 'http:') {
      const isKnownPlatform = Object.values(PLATFORM_URL_PATTERNS).some(
        pattern => pattern.test(urlObj.toString())
      );
      if (isKnownPlatform) {
        urlObj.protocol = 'https:';
      }
    }
    
    return urlObj.toString();
  } catch {
    // Return original if parsing fails (will be caught by validation)
    return url;
  }
}

/**
 * Get allowed platforms list
 */
export function getAllowedPlatforms(): string[] {
  return Object.keys(PLATFORM_URL_PATTERNS);
}

/**
 * Get allowed service types list
 */
export function getAllowedServiceTypes(): string[] {
  return [
    'views', 'subscribers', 'likes', 'comments', 'followers',
    'reels_views', 'story_views', 'shares', 'retweets'
  ];
}
