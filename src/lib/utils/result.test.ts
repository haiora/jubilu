import { describe, it, expect } from 'vitest';
import {
  type Result,
  ok,
  err,
  isOk,
  isErr,
  unwrap,
  unwrapOr,
  mapResult,
  mapError,
  andThen,
} from './result';

describe('Result Type Pattern', () => {
  describe('ok()', () => {
    it('should create a successful Result with a value', () => {
      const result = ok(42);
      expect(result).toEqual({ ok: true, value: 42 });
    });

    it('should work with string values', () => {
      const result = ok('success');
      expect(result).toEqual({ ok: true, value: 'success' });
    });

    it('should work with object values', () => {
      const user = { id: 1, name: 'Alice' };
      const result = ok(user);
      expect(result).toEqual({ ok: true, value: user });
    });

    it('should work with null values', () => {
      const result = ok(null);
      expect(result).toEqual({ ok: true, value: null });
    });
  });

  describe('err()', () => {
    it('should create a failed Result with an error', () => {
      const error = new Error('Something went wrong');
      const result = err(error);
      expect(result).toEqual({ ok: false, error });
    });

    it('should work with string errors', () => {
      const result = err('Invalid input');
      expect(result).toEqual({ ok: false, error: 'Invalid input' });
    });

    it('should work with custom error types', () => {
      const customError = { code: 404, message: 'Not found' };
      const result = err(customError);
      expect(result).toEqual({ ok: false, error: customError });
    });
  });

  describe('isOk()', () => {
    it('should return true for successful Results', () => {
      const result = ok(42);
      expect(isOk(result)).toBe(true);
    });

    it('should return false for failed Results', () => {
      const result = err('error');
      expect(isOk(result)).toBe(false);
    });

    it('should narrow type correctly', () => {
      const result: Result<number, string> = ok(42);
      if (isOk(result)) {
        // TypeScript should know result.value is number
        const value: number = result.value;
        expect(value).toBe(42);
      }
    });
  });

  describe('isErr()', () => {
    it('should return true for failed Results', () => {
      const result = err('error');
      expect(isErr(result)).toBe(true);
    });

    it('should return false for successful Results', () => {
      const result = ok(42);
      expect(isErr(result)).toBe(false);
    });

    it('should narrow type correctly', () => {
      const result: Result<number, string> = err('failed');
      if (isErr(result)) {
        // TypeScript should know result.error is string
        const error: string = result.error;
        expect(error).toBe('failed');
      }
    });
  });

  describe('unwrap()', () => {
    it('should return the value for successful Results', () => {
      const result = ok(42);
      expect(unwrap(result)).toBe(42);
    });

    it('should throw Error for failed Results with Error', () => {
      const error = new Error('Failed');
      const result = err(error);
      expect(() => unwrap(result)).toThrow('Failed');
    });

    it('should throw wrapped error for failed Results with strings', () => {
      const result = err('Failed');
      expect(() => unwrap(result)).toThrow('Failed');
    });

    it('should work with complex values', () => {
      const user = { id: 1, name: 'Alice' };
      const result = ok(user);
      expect(unwrap(result)).toEqual(user);
    });
  });

  describe('unwrapOr()', () => {
    it('should return the value for successful Results', () => {
      const result = ok(42);
      expect(unwrapOr(result, 0)).toBe(42);
    });

    it('should return default value for failed Results', () => {
      const result = err('error');
      expect(unwrapOr(result, 0)).toBe(0);
    });

    it('should work with string values', () => {
      const okResult = ok('success');
      expect(unwrapOr(okResult, 'default')).toBe('success');

      const errResult = err('error');
      expect(unwrapOr(errResult, 'default')).toBe('default');
    });
  });

  describe('mapResult()', () => {
    it('should map successful Result values', () => {
      const result = ok(5);
      const doubled = mapResult(result, x => x * 2);
      expect(doubled).toEqual(ok(10));
    });

    it('should not affect failed Results', () => {
      const result: Result<number, string> = err('error');
      const mapped = mapResult(result, x => x * 2);
      expect(mapped).toEqual(err('error'));
    });

    it('should work with type transformations', () => {
      const result = ok(42);
      const mapped = mapResult(result, x => String(x));
      expect(mapped).toEqual(ok('42'));
    });

    it('should work with object transformations', () => {
      const result = ok({ firstName: 'Alice', lastName: 'Smith' });
      const mapped = mapResult(result, user => `${user.firstName} ${user.lastName}`);
      expect(mapped).toEqual(ok('Alice Smith'));
    });
  });

  describe('mapError()', () => {
    it('should map failed Result errors', () => {
      const result = err('Not found');
      const mapped = mapError(result, e => new Error(e));
      expect(isErr(mapped)).toBe(true);
      if (isErr(mapped)) {
        expect(mapped.error).toBeInstanceOf(Error);
        expect(mapped.error.message).toBe('Not found');
      }
    });

    it('should not affect successful Results', () => {
      const result: Result<number, string> = ok(42);
      const mapped = mapError(result, e => new Error(e));
      expect(mapped).toEqual(ok(42));
    });

    it('should work with error type transformations', () => {
      const result = err(404);
      const mapped = mapError(result, code => ({ code, message: 'Not found' }));
      expect(mapped).toEqual(err({ code: 404, message: 'Not found' }));
    });
  });

  describe('andThen()', () => {
    function parseNumber(s: string): Result<number, string> {
      const n = Number(s);
      return isNaN(n) ? err('Not a number') : ok(n);
    }

    function divide(a: number, b: number): Result<number, string> {
      return b === 0 ? err('Division by zero') : ok(a / b);
    }

    it('should chain successful operations', () => {
      const result = parseNumber('10');
      const chained = andThen(result, n => divide(n, 2));
      expect(chained).toEqual(ok(5));
    });

    it('should short-circuit on first error', () => {
      const result = parseNumber('abc');
      const chained = andThen(result, n => divide(n, 2));
      expect(chained).toEqual(err('Not a number'));
    });

    it('should propagate second operation error', () => {
      const result = parseNumber('10');
      const chained = andThen(result, n => divide(n, 0));
      expect(chained).toEqual(err('Division by zero'));
    });

    it('should work with multiple chaining', () => {
      const result = parseNumber('20');
      const chained = andThen(
        andThen(result, n => divide(n, 2)),
        n => divide(n, 5)
      );
      expect(chained).toEqual(ok(2));
    });
  });

  describe('Real-world usage patterns', () => {
    it('should handle division by zero gracefully', () => {
      function safeDivide(a: number, b: number): Result<number, string> {
        if (b === 0) {
          return err('Division by zero');
        }
        return ok(a / b);
      }

      const result1 = safeDivide(10, 2);
      expect(isOk(result1) && result1.value).toBe(5);

      const result2 = safeDivide(10, 0);
      expect(isErr(result2) && result2.error).toBe('Division by zero');
    });

    it('should handle validation errors', () => {
      interface ValidationError {
        field: string;
        message: string;
      }

      function validateEmail(email: string): Result<string, ValidationError> {
        if (!email.includes('@')) {
          return err({ field: 'email', message: 'Invalid email format' });
        }
        return ok(email);
      }

      const valid = validateEmail('user@example.com');
      expect(isOk(valid)).toBe(true);

      const invalid = validateEmail('invalid-email');
      expect(isErr(invalid)).toBe(true);
      if (isErr(invalid)) {
        expect(invalid.error.field).toBe('email');
        expect(invalid.error.message).toBe('Invalid email format');
      }
    });

    it('should handle async operations', async () => {
      async function fetchUser(id: number): Promise<Result<{ id: number; name: string }, string>> {
        if (id <= 0) {
          return err('Invalid user ID');
        }
        // Simulate API call
        return ok({ id, name: 'Alice' });
      }

      const result1 = await fetchUser(1);
      expect(isOk(result1)).toBe(true);
      if (isOk(result1)) {
        expect(result1.value.name).toBe('Alice');
      }

      const result2 = await fetchUser(-1);
      expect(isErr(result2)).toBe(true);
      if (isErr(result2)) {
        expect(result2.error).toBe('Invalid user ID');
      }
    });

    it('should compose multiple operations', () => {
      interface User {
        id: number;
        email: string;
      }

      function validateUserId(id: number): Result<number, string> {
        return id > 0 ? ok(id) : err('Invalid user ID');
      }

      function validateEmail(email: string): Result<string, string> {
        return email.includes('@') ? ok(email) : err('Invalid email');
      }

      function createUser(id: number, email: string): Result<User, string> {
        const idResult = validateUserId(id);
        if (isErr(idResult)) return idResult;

        const emailResult = validateEmail(email);
        if (isErr(emailResult)) return emailResult;

        return ok({ id, email });
      }

      const validUser = createUser(1, 'user@example.com');
      expect(isOk(validUser)).toBe(true);

      const invalidId = createUser(-1, 'user@example.com');
      expect(isErr(invalidId)).toBe(true);
      if (isErr(invalidId)) {
        expect(invalidId.error).toBe('Invalid user ID');
      }

      const invalidEmail = createUser(1, 'invalid');
      expect(isErr(invalidEmail)).toBe(true);
      if (isErr(invalidEmail)) {
        expect(invalidEmail.error).toBe('Invalid email');
      }
    });
  });
});
