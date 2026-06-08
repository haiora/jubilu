/**
 * Security Utilities
 * 
 * Utility functions for security-related operations including hashing,
 * validation, sanitization, and security headers.
 */

import { hash, compare } from 'bcryptjs';

// ============================================================================
// Password Hashing
// ============================================================================

const BCRYPT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password to compare against
 * @returns True if passwords match
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid flag and error messages
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Input Sanitization
// ============================================================================

/**
 * Sanitize HTML input by removing potentially dangerous content
 * Basic implementation - consider using a library like DOMPurify for production
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol from URLs
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  
  // Remove data: protocol from URLs (can be used for XSS)
  sanitized = sanitized.replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""');
  
  return sanitized;
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitize SQL input by removing dangerous characters
 * Note: Use parameterized queries instead when possible (Drizzle ORM handles this)
 */
export function sanitizeSqlInput(input: string): string {
  // Remove SQL comment markers
  let sanitized = input.replace(/--/g, '');
  sanitized = sanitized.replace(/\/\*/g, '');
  sanitized = sanitized.replace(/\*\//g, '');
  
  // Remove semicolons (statement separator)
  sanitized = sanitized.replace(/;/g, '');
  
  return sanitized;
}

/**
 * Sanitize file name to prevent directory traversal
 */
export function sanitizeFileName(fileName: string): string {
  // Remove directory traversal attempts
  let sanitized = fileName.replace(/\.\./g, '');
  sanitized = sanitized.replace(/\//g, '');
  sanitized = sanitized.replace(/\\/g, '');
  
  // Remove special characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    const name = sanitized.substring(0, 250 - (ext?.length || 0));
    sanitized = ext ? `${name}.${ext}` : name;
  }
  
  return sanitized;
}

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate a random token for CSRF, API keys, etc.
 * @param length - Length of the token (default: 32)
 * @returns Random token string
 */
export function generateToken(length: number = 32): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  // Use crypto.getRandomValues for secure random generation
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    token += characters[randomValues[i] % characters.length];
  }
  
  return token;
}

/**
 * Generate a numeric code (e.g., for OTP)
 */
export function generateNumericCode(length: number = 6): string {
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  let code = '';
  for (let i = 0; i < length; i++) {
    code += randomValues[i] % 10;
  }
  
  return code;
}

// ============================================================================
// Rate Limiting Helpers
// ============================================================================

/**
 * Simple in-memory rate limiter (use Redis in production)
 */
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  /**
   * Check if request is allowed
   * @param key - Unique identifier (e.g., IP address, user ID)
   * @param limit - Maximum number of requests
   * @param windowMs - Time window in milliseconds
   * @returns True if request is allowed
   */
  check(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this key
    let requests = this.requests.get(key) || [];
    
    // Filter out requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (requests.length >= limit) {
      return false;
    }
    
    // Add current request
    requests.push(now);
    this.requests.set(key, requests);
    
    return true;
  }
  
  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }
  
  /**
   * Clean up old entries (call periodically)
   */
  cleanup(maxAge: number = 3600000): void {
    const now = Date.now();
    const cutoff = now - maxAge;
    
    for (const [key, requests] of Array.from(this.requests.entries())) {
      const validRequests = requests.filter(timestamp => timestamp > cutoff);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

export const rateLimiter = new InMemoryRateLimiter();

// ============================================================================
// Security Headers
// ============================================================================

/**
 * Get security headers for responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // Prevent XSS attacks
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Adjust for your needs
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
    
    // Prevent referrer leakage
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Enable HSTS (HTTP Strict Transport Security)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
}

// ============================================================================
// Email Validation
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if email domain is from a disposable email provider
 * (Basic implementation - expand list for production)
 */
export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}

// ============================================================================
// IP Address Utilities
// ============================================================================

/**
 * Extract IP address from request headers
 */
export function getClientIp(headers: Headers): string | null {
  // Check common headers (in order of preference)
  const headerKeys = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
  ];
  
  for (const key of headerKeys) {
    const value = headers.get(key);
    if (value) {
      // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2, ...)
      // We want the first one (client IP)
      return value.split(',')[0].trim();
    }
  }
  
  return null;
}

/**
 * Check if IP is in a CIDR range (basic implementation)
 */
export function isIpInRange(ip: string, cidr: string): boolean {
  // This is a simplified version - use a library like 'ip' for production
  const [range, bits] = cidr.split('/');
  const mask = -1 << (32 - parseInt(bits, 10));
  
  const ipNum = ipToNumber(ip);
  const rangeNum = ipToNumber(range);
  
  return (ipNum & mask) === (rangeNum & mask);
}

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

// ============================================================================
// Honeypot Field
// ============================================================================

/**
 * Generate a honeypot field name (changes periodically to avoid bot learning)
 */
export function getHoneypotFieldName(): string {
  const timestamp = Math.floor(Date.now() / 3600000); // Changes every hour
  return `field_${timestamp}`;
}

/**
 * Check if honeypot field was filled (indicates bot)
 */
export function isHoneypotTriggered(formData: FormData | Record<string, unknown>): boolean {
  const honeypotField = getHoneypotFieldName();
  
  if (formData instanceof FormData) {
    return formData.get(honeypotField) !== null && formData.get(honeypotField) !== '';
  }
  
  return honeypotField in formData && formData[honeypotField] !== '';
}

// ============================================================================
// CSRF Token
// ============================================================================

/**
 * Generate a CSRF token for a session
 */
export function generateCsrfToken(): string {
  return generateToken(32);
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false;
  
  // Use constant-time comparison to prevent timing attacks
  if (token.length !== expectedToken.length) return false;
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  
  return result === 0;
}
