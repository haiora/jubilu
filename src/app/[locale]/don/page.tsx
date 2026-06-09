'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Heart, HandCoins, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const PRESETS = [25, 50, 100, 250, 500];

interface DonationForm {
  amount: number;
  name: string;
  email: string;
  message: string;
  recurring: boolean;
}

export default function DonationPage() {
  const t = useTranslations('donation');
  const locale = useLocale();
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [form, setForm] = useState<DonationForm>({ amount: 50, name: '', email: '', message: '', recurring: false });
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const formatEUR = (cents: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(cents / 100);

  const finalAmount = isCustom ? Math.round(parseFloat(customAmount || '0') * 100) : form.amount * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount <= 0) return;
    setStep('confirm');
  };

  const handleConfirm = () => {
    const donation = {
      id: `DON-${Date.now()}`,
      amount: finalAmount,
      name: form.name,
      email: form.email,
      message: form.message,
      recurring: form.recurring,
      date: new Date().toISOString(),
      status: 'pending'
    };
    const existing = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('jubilee_donations') || '[]' : '[]');
    existing.push(donation);
    localStorage.setItem('jubilee_donations', JSON.stringify(existing));
    setStep('success');
  };

  if (step === 'success') {
    return (
      <section className="relative min-h-[85vh] flex items-center justify-center py-16">
        <div className="absolute inset-0 z-0">
          <Image src="/images/hero-jerusalem.png" alt="" fill className="object-cover opacity-30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/90 via-foreground/80 to-background/90 backdrop-blur-sm" />
        </div>
        <div className="container relative z-10 mx-auto max-w-md text-center animate-fade-up">
          <div className="glass rounded-[2rem] border border-white/10 p-10 shadow-2xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-white">{t('successTitle')}</h1>
            <p className="mt-4 text-white/70">{t('successText', { amount: formatEUR(finalAmount) })}</p>
            <div className="mt-8 space-y-3">
              <Button variant="gold" className="w-full" asChild>
                <a href={`/${locale}/`}>{t('backHome')}</a>
              </Button>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" asChild>
                <a href={`/${locale}/boutique/`}>{t('visitShop')}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (step === 'confirm') {
    return (
      <section className="relative min-h-[85vh] flex items-center justify-center py-16">
        <div className="absolute inset-0 z-0">
          <Image src="/images/hero-jerusalem.png" alt="" fill className="object-cover opacity-30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/90 via-foreground/80 to-background/90 backdrop-blur-sm" />
        </div>
        <div className="container relative z-10 mx-auto max-w-md animate-fade-up">
          <div className="glass rounded-[2rem] border border-white/10 p-10 shadow-2xl">
            <h1 className="font-serif text-2xl font-semibold text-white text-center mb-6">{t('confirmTitle')}</h1>
            <div className="space-y-4 rounded-xl bg-white/5 border border-white/10 p-6 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">{t('amount')}</span>
                <span className="text-white font-semibold text-lg">{formatEUR(finalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">{t('name')}</span>
                <span className="text-white">{form.name || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">{t('email')}</span>
                <span className="text-white">{form.email || '—'}</span>
              </div>
              {form.recurring && <p className="text-xs text-gold">{t('recurringLabel')}</p>}
            </div>
            <p className="text-xs text-white/50 text-center mb-6">{t('stripeNote')}</p>
            <div className="space-y-3">
              <Button variant="gold" className="w-full" onClick={handleConfirm}>
                {t('confirmButton')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" onClick={() => setStep('form')}>
                {t('backButton')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center py-16">
      <div className="absolute inset-0 z-0">
        <Image src="/images/hero-jerusalem.png" alt="" fill className="object-cover opacity-30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/90 via-foreground/80 to-background/90 backdrop-blur-sm" />
      </div>

      <div className="container relative z-10 mx-auto max-w-lg animate-fade-up">
        <div className="glass rounded-[2rem] border border-white/10 p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/20">
              <Heart className="h-7 w-7 text-gold" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-white">{t('title')}</h1>
            <p className="mt-2 text-white/60">{t('subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="mb-3 block text-sm font-medium text-white/80">{t('chooseAmount')}</label>
              <div className="grid grid-cols-5 gap-2">
                {PRESETS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => { setForm((f) => ({ ...f, amount: a })); setIsCustom(false); }}
                    className={`rounded-xl py-2.5 text-sm font-medium transition-all ${
                      !isCustom && form.amount === a
                        ? 'bg-gold text-foreground shadow-[0_0_15px_-3px_hsl(var(--gold))]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {a}€
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="custom"
                  checked={isCustom}
                  onChange={(e) => setIsCustom(e.target.checked)}
                  className="h-4 w-4 rounded border-white/30 bg-white/10 accent-gold"
                />
                <label htmlFor="custom" className="text-sm text-white/70">{t('customAmount')}</label>
                {isCustom && (
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="ml-2 w-24 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white outline-none focus:border-gold"
                    placeholder="50"
                    autoFocus
                  />
                )}
              </div>
            </div>

            {/* Personal info */}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">{t('nameLabel')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none ring-gold focus:ring-2 transition-all placeholder:text-white/30"
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">{t('emailLabel')}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none ring-gold focus:ring-2 transition-all placeholder:text-white/30"
                  placeholder="jean@example.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">{t('messageLabel')}</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none ring-gold focus:ring-2 transition-all placeholder:text-white/30 resize-none"
                  placeholder={t('messagePlaceholder')}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={form.recurring}
                  onChange={(e) => setForm((f) => ({ ...f, recurring: e.target.checked }))}
                  className="h-4 w-4 rounded border-white/30 bg-white/10 accent-gold"
                />
                <label htmlFor="recurring" className="text-sm text-white/70">{t('recurring')}</label>
              </div>
            </div>

            <Button type="submit" variant="gold" size="lg" className="w-full h-12 text-base shadow-[0_0_20px_-5px_hsl(var(--gold))]">
              <HandCoins className="mr-2 h-5 w-5" /> {t('donateButton')}
            </Button>

            <p className="text-center text-xs text-white/40">{t('secureNote')}</p>
          </form>
        </div>
      </div>
    </section>
  );
}
