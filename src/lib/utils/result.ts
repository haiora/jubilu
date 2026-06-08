/**
 * Result Type Pattern for Error Handling
 * 
 * This module provides a type-safe way to handle operations that can fail,
 * inspired by Rust's Result<T, E> type and the Either monad pattern.
 * 
 * Instead of throwing exceptions or using try-catch blocks everywhere,
 * functions return a Result that explicitly represents success or failure.
 * 
 * @example
 * ```typescript
 * // Function that returns Result
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) {
 *     return err("Division by zero");
 *   }
 *   return ok(a / b);
 * }
 * 
 * // Using the Result
 * const result = divide(10, 2);
 * if (result.ok) {
 *   console.log("Success:", result.value); // 5
 * } else {
 *   console.error("Error:", result.error);
 * }
 * 
 * // Using type guards
 * if (isOk(result)) {
 *   // TypeScript knows result.value is available
 *   const value = result.value;
 * } else {
 *   // TypeScript knows result.error is available
 *   const error = result.error;
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // In a service
 * export const contactsService = {
 *   async create(data: CreateContactInput): Promise<Result<Contact, ValidationError>> {
 *     const validation = validateContactInput(data);
 *     if (!validation.success) {
 *       return err(new ValidationError(validation.errors));
 *     }
 * 
 *     try {
 *       const contact = await contactsRepository.create(data);
 *       return ok(contact);
 *     } catch (e) {
 *       if (e instanceof UniqueConstraintError) {
 *         return err(new ValidationError({ email: 'Email already exists' }));
 *       }
 *       throw e; // Unexpected errors are still thrown
 *     }
 *   }
 * };
 * 
 * // In an API route
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *   const result = await contactsService.create(body);
 * 
 *   if (!result.ok) {
 *     return Response.json({ error: result.error.message }, { status: 400 });
 *   }
 * 
 *   return Response.json(result.value, { status: 201 });
 * }
 * ```
 */

/**
 * Result type representing either success (Ok) or failure (Err)
 * 
 * @template T - The type of the success value
 * @template E - The type of the error (defaults to Error)
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Creates a successful Result containing a value
 * 
 * @template T - The type of the success value
 * @param value - The success value to wrap
 * @returns A Result representing success
 * 
 * @example
 * ```typescript
 * const result = ok(42);
 * // result = { ok: true, value: 42 }
 * ```
 */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/**
 * Creates a failed Result containing an error
 * 
 * @template E - The type of the error
 * @param error - The error to wrap
 * @returns A Result representing failure
 * 
 * @example
 * ```typescript
 * const result = err(new Error("Something went wrong"));
 * // result = { ok: false, error: Error("Something went wrong") }
 * 
 * const result2 = err("Invalid input");
 * // result2 = { ok: false, error: "Invalid input" }
 * ```
 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Type guard to check if a Result is successful
 * 
 * @template T - The type of the success value
 * @template E - The type of the error
 * @param result - The Result to check
 * @returns True if the Result represents success
 * 
 * @example
 * ```typescript
 * const result = divide(10, 2);
 * 
 * if (isOk(result)) {
 *   // TypeScript knows result is { ok: true; value: number }
 *   console.log(result.value);
 * }
 * ```
 */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok === true;
}

/**
 * Type guard to check if a Result is a failure
 * 
 * @template T - The type of the success value
 * @template E - The type of the error
 * @param result - The Result to check
 * @returns True if the Result represents failure
 * 
 * @example
 * ```typescript
 * const result = divide(10, 0);
 * 
 * if (isErr(result)) {
 *   // TypeScript knows result is { ok: false; error: E }
 *   console.error(result.error);
 * }
 * ```
 */
export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return result.ok === false;
}

/**
 * Unwraps a Result, returning the value or throwing the error
 * 
 * Use this when you're certain the Result is Ok, or when you want to
 * propagate errors as exceptions.
 * 
 * @template T - The type of the success value
 * @template E - The type of the error
 * @param result - The Result to unwrap
 * @returns The success value
 * @throws The error if the Result is Err
 * 
 * @example
 * ```typescript
 * const result = ok(42);
 * const value = unwrap(result); // 42
 * 
 * const failResult = err("Failed");
 * const value2 = unwrap(failResult); // throws "Failed"
 * ```
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (isOk(result)) {
    return result.value;
  }
  if (result.error instanceof Error) {
    throw result.error;
  }
  throw new Error(String(result.error));
}

/**
 * Unwraps a Result, returning the value or a default value if Err
 * 
 * @template T - The type of the success value
 * @template E - The type of the error
 * @param result - The Result to unwrap
 * @param defaultValue - The value to return if Result is Err
 * @returns The success value or the default value
 * 
 * @example
 * ```typescript
 * const result = err("Failed");
 * const value = unwrapOr(result, 0); // 0
 * 
 * const okResult = ok(42);
 * const value2 = unwrapOr(okResult, 0); // 42
 * ```
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (isOk(result)) {
    return result.value;
  }
  return defaultValue;
}

/**
 * Maps a Result's value to a new value, leaving errors unchanged
 * 
 * @template T - The type of the original success value
 * @template U - The type of the mapped success value
 * @template E - The type of the error
 * @param result - The Result to map
 * @param fn - The mapping function
 * @returns A new Result with the mapped value or the original error
 * 
 * @example
 * ```typescript
 * const result = ok(5);
 * const doubled = mapResult(result, x => x * 2); // ok(10)
 * 
 * const errResult = err("Failed");
 * const mapped = mapResult(errResult, x => x * 2); // err("Failed")
 * ```
 */
export function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (isOk(result)) {
    return ok(fn(result.value));
  }
  return result;
}

/**
 * Maps a Result's error to a new error, leaving values unchanged
 * 
 * @template T - The type of the success value
 * @template E - The type of the original error
 * @template F - The type of the mapped error
 * @param result - The Result to map
 * @param fn - The mapping function for errors
 * @returns A new Result with the original value or the mapped error
 * 
 * @example
 * ```typescript
 * const result = err("Not found");
 * const mapped = mapError(result, e => new Error(e)); // err(Error("Not found"))
 * 
 * const okResult = ok(42);
 * const unchanged = mapError(okResult, e => new Error(e)); // ok(42)
 * ```
 */
export function mapError<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  if (isErr(result)) {
    return err(fn(result.error));
  }
  return result;
}

/**
 * Chains Result-returning operations together (flatMap/bind)
 * 
 * @template T - The type of the original success value
 * @template U - The type of the new success value
 * @template E - The type of the error
 * @param result - The Result to chain from
 * @param fn - A function that takes the success value and returns a new Result
 * @returns The new Result or the original error
 * 
 * @example
 * ```typescript
 * function parseNumber(s: string): Result<number, string> {
 *   const n = Number(s);
 *   return isNaN(n) ? err("Not a number") : ok(n);
 * }
 * 
 * function divide(a: number, b: number): Result<number, string> {
 *   return b === 0 ? err("Division by zero") : ok(a / b);
 * }
 * 
 * const result = andThen(parseNumber("10"), n => divide(n, 2)); // ok(5)
 * const errResult = andThen(parseNumber("abc"), n => divide(n, 2)); // err("Not a number")
 * ```
 */
export function andThen<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (isOk(result)) {
    return fn(result.value);
  }
  return result;
}
