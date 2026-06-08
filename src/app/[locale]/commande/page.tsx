'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useCart } from '@/components/shop/cart-context';
import { Button } from '@/components/ui/button';
import { getProduct, formatPrice } from '@/lib/catalog';
import type { Locale } from '@/i18n/routing';

export default function CheckoutPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations('checkout');
  const tcart = useTranslations('cart');
  const tcontact = useTranslations('pages.contact');
  const tcommon = useTranslations('common');
  const { items, clear } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState('');

  const lines = items.map((item) => ({ item, product: getProduct(item.slug) })).filter((l) => l.product);
  const total = lines.reduce((sum, l) => sum + l.product!.price * l.item.qty, 0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const data = {
      email: form.get('email') as string,
      firstName: form.get('firstName') as string,
      lastName: form.get('lastName') as string,
      phone: form.get('phone') as string,
      address: form.get('address') as string,
      zip: form.get('zip') as string,
      city: form.get('city') as string,
      country: form.get('country') as string
    };

    if (!data.email || !data.firstName || !data.lastName || !data.address || !data.zip || !data.city || !data.country) {
      setError(tcommon('formIncomplete'));
      setSubmitting(false);
      return;
    }

    try {
      const orderNumber = `JBL-${Date.now().toString(36).toUpperCase()}`;
      const order = {
        number: orderNumber,
        items: lines.map((l) => ({
          name: l.product!.translations[locale].name,
          qty: l.item.qty,
          price: l.product!.price,
          customText: l.item.customText || null
        })),
        contact: data,
        total,
        locale,
        date: new Date().toISOString()
      };
      const existing = JSON.parse(localStorage.getItem('jubilee_orders') || '[]');
      existing.unshift(order);
      localStorage.setItem('jubilee_orders', JSON.stringify(existing));
      clear();
      window.location.href = `/${locale}/commande/success?order=${orderNumber}`;
    } catch (err) {
      setError(String(err));
      setSubmitting(false);
    }
  }

  const field = 'h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none ring-gold focus:ring-2';

  if (orderNumber) {
    return (
      <section className="container py-16">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
          <CheckCircle2 className="h-14 w-14 text-secondary" />
          <h1 className="mt-4 text-2xl font-semibold">{t('success')}</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{orderNumber}</p>
          <p className="mt-4 text-muted-foreground">{t('successText')}</p>
          <Button asChild variant="gold" className="mt-6">
            <Link href="/boutique">{t('backToShop')}</Link>
          </Button>
        </div>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className="container py-16 text-center">
        <p className="text-lg text-muted-foreground">{tcart('empty')}</p>
        <Button asChild variant="gold" className="mt-6">
          <Link href="/boutique">{tcart('emptyCta')}</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="container py-12">
      <h1 className="text-3xl font-semibold md:text-4xl">{t('title')}</h1>
      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <fieldset className="rounded-2xl border border-border bg-card p-6">
            <legend className="px-2 font-semibold">{t('contact')}</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <input required name="firstName" placeholder={tcontact('firstName')} className={field} autoComplete="given-name" />
              <input required name="lastName" placeholder={tcontact('lastName')} className={field} autoComplete="family-name" />
            </div>
            <input required type="email" name="email" placeholder={tcontact('email')} className={`${field} mt-4`} autoComplete="email" />
            <input name="phone" placeholder={t('phone')} className={`${field} mt-4`} autoComplete="tel" />
          </fieldset>

          <fieldset className="rounded-2xl border border-border bg-card p-6">
            <legend className="px-2 font-semibold">{t('shipping')}</legend>
            <input required name="address" placeholder={t('address')} className={field} autoComplete="street-address" />
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <input required name="zip" placeholder={t('zip')} className={field} autoComplete="postal-code" />
              <input required name="city" placeholder={t('city')} className={field} autoComplete="address-level2" />
              <input required name="country" placeholder={t('country')} className={field} autoComplete="country-name" />
            </div>
          </fieldset>

          <div className="flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold/5 p-4 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <p>{t('ageNotice')}</p>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">{t('summary')}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {lines.map((l, i) => (
              <li key={i} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{l.product!.translations[locale].name} × {l.item.qty}</span>
                <span>{formatPrice(l.product!.price * l.item.qty, locale)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-lg font-semibold">
            <span>{t('summary')}</span>
            <span className="text-primary">{formatPrice(total, locale)}</span>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <Button type="submit" variant="gold" size="lg" disabled={submitting} className="mt-6 w-full">
            <CreditCard className="h-4 w-4" /> {t('placeOrder')}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">{t('stripeNote')}</p>
        </aside>
      </form>
    </section>
  );
}