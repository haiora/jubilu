/**
 * Date Utilities
 * 
 * Utility functions for date manipulation, calculations, and comparisons.
 */

import type { DateRange } from '@/types/domain';

// ============================================================================
// Date Creation
// ============================================================================

/**
 * Get current date with time set to start of day
 */
export function startOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get current date with time set to end of day
 */
export function endOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of week (Monday)
 */
export function startOfWeek(date: Date = new Date()): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Adjust when day is Sunday
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of week (Sunday)
 */
export function endOfWeek(date: Date = new Date()): Date {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of month
 */
export function startOfMonth(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of month
 */
export function endOfMonth(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0); // 0th day of next month = last day of current month
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of year
 */
export function startOfYear(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of year
 */
export function endOfYear(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
}

// ============================================================================
// Date Arithmetic
// ============================================================================

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add weeks to a date
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add years to a date
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Subtract days from a date
 */
export function subDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Subtract months from a date
 */
export function subMonths(date: Date, months: number): Date {
  return addMonths(date, -months);
}

/**
 * Subtract years from a date
 */
export function subYears(date: Date, years: number): Date {
  return addYears(date, -years);
}

// ============================================================================
// Date Comparison
// ============================================================================

/**
 * Check if a date is before another date
 */
export function isBefore(date: Date, compareDate: Date): boolean {
  return date.getTime() < compareDate.getTime();
}

/**
 * Check if a date is after another date
 */
export function isAfter(date: Date, compareDate: Date): boolean {
  return date.getTime() > compareDate.getTime();
}

/**
 * Check if a date is the same as another date (ignoring time)
 */
export function isSameDay(date: Date, compareDate: Date): boolean {
  return (
    date.getFullYear() === compareDate.getFullYear() &&
    date.getMonth() === compareDate.getMonth() &&
    date.getDate() === compareDate.getDate()
  );
}

/**
 * Check if a date is within a date range
 */
export function isWithinRange(date: Date, range: DateRange): boolean {
  return !isBefore(date, range.start) && !isAfter(date, range.end);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  return isBefore(date, new Date());
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  return isAfter(date, new Date());
}

// ============================================================================
// Date Differences
// ============================================================================

/**
 * Get difference in days between two dates
 */
export function diffInDays(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = Math.abs(date1.getTime() - date2.getTime());
  return Math.floor(diff / oneDay);
}

/**
 * Get difference in hours between two dates
 */
export function diffInHours(date1: Date, date2: Date): number {
  const oneHour = 60 * 60 * 1000;
  const diff = Math.abs(date1.getTime() - date2.getTime());
  return Math.floor(diff / oneHour);
}

/**
 * Get difference in minutes between two dates
 */
export function diffInMinutes(date1: Date, date2: Date): number {
  const oneMinute = 60 * 1000;
  const diff = Math.abs(date1.getTime() - date2.getTime());
  return Math.floor(diff / oneMinute);
}

// ============================================================================
// Relative Time
// ============================================================================

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: Date, baseDate: Date = new Date()): string {
  const diffMs = date.getTime() - baseDate.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  
  const isPast = diffMs < 0;
  const suffix = isPast ? 'ago' : 'from now';
  
  if (Math.abs(diffSec) < 60) {
    return isPast ? 'just now' : 'in a moment';
  } else if (Math.abs(diffMin) < 60) {
    const value = Math.abs(diffMin);
    return `${value} minute${value !== 1 ? 's' : ''} ${suffix}`;
  } else if (Math.abs(diffHour) < 24) {
    const value = Math.abs(diffHour);
    return `${value} hour${value !== 1 ? 's' : ''} ${suffix}`;
  } else if (Math.abs(diffDay) < 7) {
    const value = Math.abs(diffDay);
    return `${value} day${value !== 1 ? 's' : ''} ${suffix}`;
  } else if (Math.abs(diffWeek) < 4) {
    const value = Math.abs(diffWeek);
    return `${value} week${value !== 1 ? 's' : ''} ${suffix}`;
  } else if (Math.abs(diffMonth) < 12) {
    const value = Math.abs(diffMonth);
    return `${value} month${value !== 1 ? 's' : ''} ${suffix}`;
  } else {
    const value = Math.abs(diffYear);
    return `${value} year${value !== 1 ? 's' : ''} ${suffix}`;
  }
}

// ============================================================================
// Common Date Ranges
// ============================================================================

/**
 * Get today's date range
 */
export function getTodayRange(): DateRange {
  return {
    start: startOfDay(),
    end: endOfDay(),
  };
}

/**
 * Get this week's date range
 */
export function getThisWeekRange(): DateRange {
  return {
    start: startOfWeek(),
    end: endOfWeek(),
  };
}

/**
 * Get this month's date range
 */
export function getThisMonthRange(): DateRange {
  return {
    start: startOfMonth(),
    end: endOfMonth(),
  };
}

/**
 * Get this year's date range
 */
export function getThisYearRange(): DateRange {
  return {
    start: startOfYear(),
    end: endOfYear(),
  };
}

/**
 * Get last N days date range
 */
export function getLastNDaysRange(days: number): DateRange {
  return {
    start: startOfDay(subDays(new Date(), days - 1)),
    end: endOfDay(),
  };
}

/**
 * Get last month's date range
 */
export function getLastMonthRange(): DateRange {
  const today = new Date();
  const lastMonth = subMonths(today, 1);
  return {
    start: startOfMonth(lastMonth),
    end: endOfMonth(lastMonth),
  };
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if a value is a valid date
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Parse a date string to Date object
 */
export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString);
  return isValidDate(date) ? date : null;
}

/**
 * Convert Date to ISO string (YYYY-MM-DD)
 */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Convert Date to ISO DateTime string
 */
export function toISODateTime(date: Date): string {
  return date.toISOString();
}
