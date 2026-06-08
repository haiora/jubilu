/**
 * Error Hierarchy for Jubilu System
 * Provides custom error classes for consistent error handling across the application
 */

/**
 * Base application error class that all custom errors extend from
 */
export class AppError extends Error {
  /**
   * Creates an instance of AppError
   * @param message - Human-readable error message
   * @param code - Machine-readable error code (e.g., 'VALIDATION_ERROR')
   * @param statusCode - HTTP status code (default: 500)
   * @param details - Additional error details (validation errors, etc.)
   */
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Log error creation for debugging
    this.logError();
  }

  /**
   * Serializes error for API responses
   * @returns Serialized error object suitable for JSON responses
   */
  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        details: this.details,
      },
    };
  }

  /**
   * Logs error with appropriate level based on status code
   */
  private logError() {
    const errorLog = {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: new Date().toISOString(),
      stack: this.stack,
    };

    // Client errors (4xx) are logged as warnings
    // Server errors (5xx) are logged as errors
    if (this.statusCode >= 500) {
      console.error('[AppError]', errorLog);
    } else if (this.statusCode >= 400) {
      console.warn('[AppError]', errorLog);
    } else {
      console.info('[AppError]', errorLog);
    }
  }
}

/**
 * ValidationError - Used for input validation failures
 * Status Code: 400 Bad Request
 */
export class ValidationError extends AppError {
  /**
   * Creates a validation error with field-specific error messages
   * @param details - Object mapping field names to error messages
   * @example
   * throw new ValidationError({ email: 'Invalid email format', age: 'Must be 18 or older' });
   */
  constructor(details: Record<string, string>) {
    super('Validation failed', 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * NotFoundError - Used when a requested resource doesn't exist
 * Status Code: 404 Not Found
 */
export class NotFoundError extends AppError {
  /**
   * Creates a not found error for a specific entity
   * @param entity - Type of entity that wasn't found (e.g., 'Contact', 'Order')
   * @param id - ID of the entity that wasn't found
   * @example
   * throw new NotFoundError('Contact', 'abc123');
   */
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`, 'NOT_FOUND', 404, { entity, id });
  }
}

/**
 * UnauthorizedError - Used when authentication is required but not provided
 * Status Code: 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
  /**
   * Creates an unauthorized error
   * @param message - Optional custom message (default: 'Unauthorized')
   * @example
   * throw new UnauthorizedError('Invalid credentials');
   */
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

/**
 * ForbiddenError - Used when user is authenticated but lacks permission
 * Status Code: 403 Forbidden
 */
export class ForbiddenError extends AppError {
  /**
   * Creates a forbidden error
   * @param message - Optional custom message (default: 'Forbidden')
   * @param requiredPermission - Optional permission that was required
   * @example
   * throw new ForbiddenError('Insufficient permissions', 'admin:contacts:delete');
   */
  constructor(message = 'Forbidden', requiredPermission?: string) {
    super(
      message,
      'FORBIDDEN',
      403,
      requiredPermission ? { requiredPermission } : undefined
    );
  }
}

/**
 * ConflictError - Used when request conflicts with current state
 * Status Code: 409 Conflict
 */
export class ConflictError extends AppError {
  /**
   * Creates a conflict error (e.g., duplicate resource, concurrent modification)
   * @param message - Description of the conflict
   * @param details - Optional additional conflict details
   * @example
   * throw new ConflictError('Email already exists', { email: 'user@example.com' });
   */
  constructor(message: string, details?: unknown) {
    super(message, 'CONFLICT', 409, details);
  }
}

/**
 * RateLimitError - Used when rate limit is exceeded
 * Status Code: 429 Too Many Requests
 */
export class RateLimitError extends AppError {
  /**
   * Creates a rate limit error
   * @param retryAfter - Number of seconds to wait before retrying
   * @example
   * throw new RateLimitError(60); // Retry after 60 seconds
   */
  constructor(retryAfter: number) {
    super('Too many requests', 'RATE_LIMIT', 429, { retryAfter });
  }
}

/**
 * ExternalServiceError - Used when external service call fails
 * Status Code: 502 Bad Gateway
 */
export class ExternalServiceError extends AppError {
  /**
   * Creates an external service error
   * @param service - Name of the external service (e.g., 'Stripe', 'Resend')
   * @param originalError - The original error from the external service
   * @example
   * try {
   *   await stripe.charges.create(...);
   * } catch (err) {
   *   throw new ExternalServiceError('Stripe', err);
   * }
   */
  constructor(service: string, originalError: Error) {
    super(
      `External service error: ${service}`,
      'EXTERNAL_SERVICE_ERROR',
      502,
      {
        service,
        originalError: originalError.message,
        originalStack: originalError.stack,
      }
    );
  }
}

/**
 * Type guard to check if an error is an AppError
 * @param error - Error to check
 * @returns True if error is an instance of AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Serializes any error into a consistent API response format
 * @param error - Error to serialize
 * @returns Serialized error object with statusCode
 */
export function serializeError(error: unknown): {
  statusCode: number;
  body: {
    error: {
      name: string;
      message: string;
      code: string;
      details?: unknown;
    };
  };
} {
  // AppError instances
  if (isAppError(error)) {
    return {
      statusCode: error.statusCode,
      body: error.toJSON(),
    };
  }

  // Standard Error instances
  if (error instanceof Error) {
    return {
      statusCode: 500,
      body: {
        error: {
          name: error.name,
          message: error.message,
          code: 'INTERNAL_ERROR',
        },
      },
    };
  }

  // Unknown error types
  return {
    statusCode: 500,
    body: {
      error: {
        name: 'UnknownError',
        message: 'An unknown error occurred',
        code: 'UNKNOWN_ERROR',
        details: String(error),
      },
    },
  };
}

/**
 * Logs an error with contextual information
 * @param error - Error to log
 * @param context - Additional context about where/why the error occurred
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  
  if (isAppError(error)) {
    // AppError already logs itself, but we can add context
    if (context) {
      if (error.statusCode >= 500) {
        console.error('[Error Context]', { timestamp, context });
      } else {
        console.warn('[Error Context]', { timestamp, context });
      }
    }
  } else if (error instanceof Error) {
    // Standard errors need manual logging
    console.error('[Error]', {
      timestamp,
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
    });
  } else {
    // Unknown error types
    console.error('[Unknown Error]', {
      timestamp,
      error: String(error),
      context,
    });
  }
}
