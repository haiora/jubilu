import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const contactSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

describe('Validation', () => {
  it('should validate a correct contact form submission', () => {
    const result = contactSchema.safeParse({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      message: 'Ceci est un test valide de plus de 10 caractères.'
    });
    
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = contactSchema.safeParse({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'invalid-email',
      message: 'Ceci est un test valide de plus de 10 caractères.'
    });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('email');
    }
  });

  it('should reject short messages', () => {
    const result = contactSchema.safeParse({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      message: 'Court'
    });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('message');
    }
  });
});
