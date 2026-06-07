'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { z } from 'zod';

const contactSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères.'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  email: z.string().email('Adresse email invalide.'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères.'),
});

export function ContactForm() {
  const t = useTranslations('pages.contact');
  const locale = useLocale();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      setSubmitting(false);
      return;
    }

    try {
      const payload = { ...data, locale };
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('failed');
      
      toast.success('Message envoyé !', {
        description: t('infoText')
      });
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error('Erreur', {
        description: t('error')
      });
    } finally {
      setSubmitting(false);
    }
  }

  const field =
    'h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none ring-gold focus:ring-2';

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">{t('firstName')}</label>
          <input className={field} name="firstName" autoComplete="given-name" />
          {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('lastName')}</label>
          <input className={field} name="lastName" autoComplete="family-name" />
          {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t('email')}</label>
        <input type="email" className={field} name="email" autoComplete="email" />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t('subject')}</label>
        <input className={field} name="subject" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t('message')}</label>
        <textarea rows={5} className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none ring-gold focus:ring-2" name="message" />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
      </div>
      {/* Honeypot anti-spam */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <Button type="submit" variant="gold" size="lg" className="w-full sm:w-auto" disabled={submitting}>
        {submitting ? 'Envoi...' : t('send')} <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
