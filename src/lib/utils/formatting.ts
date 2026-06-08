/**
 * Formatting Utilities
 * 
 * Utility functions for formatting dates, currency, numbers, and other values
 * for display in the user interface with proper localization support.
 */

import type { Locale } from '@/types/domain';

// ============================================================================
// Currency Formatting
// ============================================================================

/**
 * Format an amount in cents to a currency string
 * @param amountInCents - Amount in cents (e.g., 1599 for €15.99)
 * @param locale - Locale for formatting
 * @param currency - Currency code (default: EUR)
 */
export function formatCurrency(
  amountInCents: number,
  locale: Locale = 'fr',
  currency: string = 'EUR'
): string {
  const amount = amountInCents / 100;
  
  const formatter = new Intl.NumberFormat(getIntlLocale(locale), {
    style: 'currency',
    currency,
  });
  
  return formatter.format(amount);
}

/**
 * Format an amount in cents to a compact currency string (e.g., 1.5K)
 */
export function formatCompactCurrency(
  amountInCents: number,
  locale: Locale = 'fr',
  currency: string = 'EUR'
): string {
  const amount = amountInCents / 100;
  
  const formatter = new Intl.NumberFormat(getIntlLocale(locale), {
    style: 'currency',
    currency,
    notation: 'compact',
    compactDisplay: 'short',
  });
  
  return formatter.format(amount);
}

// ============================================================================
// Number Formatting
// ============================================================================

/**
 * Format a number with locale-specific separators
 */
export function formatNumber(
  value: number,
  locale: Locale = 'fr',
  options?: Intl.NumberFormatOptions
): string {
  const formatter = new Intl.NumberFormat(getIntlLocale(locale), options);
  return formatter.format(value);
}

/**
 * Format a percentage value
 */
export function formatPercent(
  value: number,
  locale: Locale = 'fr',
  decimals: number = 1
): string {
  const formatter = new Intl.NumberFormat(getIntlLocale(locale), {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return formatter.format(value / 100);
}

/**
 * Format a number in compact notation (e.g., 1.5K, 2.3M)
 */
export function formatCompactNumber(
  value: number,
  locale: Locale = 'fr'
): string {
  const formatter = new Intl.NumberFormat(getIntlLocale(locale), {
    notation: 'compact',
    compactDisplay: 'short',
  });
  
  return formatter.format(value);
}

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Format a date to a locale-specific string
 */
export function formatDate(
  date: Date | string,
  locale: Locale = 'fr',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  const formatter = new Intl.DateTimeFormat(
    getIntlLocale(locale),
    options || defaultOptions
  );
  
  return formatter.format(dateObj);
}

/**
 * Format a date to a short locale-specific string (e.g., 15/06/2024)
 */
export function formatDateShort(
  date: Date | string,
  locale: Locale = 'fr'
): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format a date with time
 */
export function formatDateTime(
  date: Date | string,
  locale: Locale = 'fr'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const formatter = new Intl.DateTimeFormat(getIntlLocale(locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return formatter.format(dateObj);
}

/**
 * Format time only
 */
export function formatTime(
  date: Date | string,
  locale: Locale = 'fr'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const formatter = new Intl.DateTimeFormat(getIntlLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return formatter.format(dateObj);
}

// ============================================================================
// Text Formatting
// ============================================================================

/**
 * Capitalize the first letter of a string
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format a name from firstName and lastName
 */
export function formatName(firstName?: string, lastName?: string): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.join(' ') || 'N/A';
}

/**
 * Format an email address to a display-friendly format
 * (e.g., long emails truncated in the middle)
 */
export function formatEmail(email: string, maxLength: number = 30): string {
  if (email.length <= maxLength) return email;
  
  const [local, domain] = email.split('@');
  const availableLength = maxLength - domain.length - 4; // -4 for "...@"
  
  if (availableLength < 3) return truncate(email, maxLength);
  
  const truncatedLocal = local.slice(0, availableLength);
  return `${truncatedLocal}...@${domain}`;
}

/**
 * Format a phone number (simple version, can be enhanced)
 */
export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    // French format: XX XX XX XX XX
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  // Return original if not recognized
  return phone;
}

// ============================================================================
// Address Formatting
// ============================================================================

/**
 * Format a full address to a single line
 */
export function formatAddress(address: {
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
}): string {
  const parts = [
    address.line1,
    address.line2,
    `${address.postalCode} ${address.city}`,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
}

// ============================================================================
// Status Formatting
// ============================================================================

/**
 * Format a status to a human-readable label
 */
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map(capitalize)
    .join(' ');
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map application locales to Intl locales
 */
function getIntlLocale(locale: Locale): string {
  const localeMap: Record<Locale, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    es: 'es-ES',
    he: 'he-IL',
  };
  
  return localeMap[locale] || 'fr-FR';
}

/**
 * Check if a locale uses RTL direction
 */
export function isRTL(locale: Locale): boolean {
  return locale === 'he';
}

/**
 * Get text direction for a locale
 */
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}
