'use client';

import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, Package, Mail } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function SuccessPage() {
  const locale = useLocale();
  const t = useTranslations('checkout');
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || 'JBL-XXXXXX';

  // Retrieve order details from localStorage for display
  const orders = JSON.parse(
    typeof window !== 'undefined' ? localStorage.getItem('jubilee_orders') || '[]' : '[]'
  );
  const order = orders.find((o: any) => o.number === orderNumber);

  return (
    <section className="container py-16">
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-gold animate-pulse">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="mt-6 font-serif text-3xl font-bold text-foreground">{t('success')}</h1>
        <div className="mt-3 inline-block rounded-lg bg-accent px-4 py-1.5 font-mono text-sm font-semibold text-primary">
          {orderNumber}
        </div>
        <p className="mt-5 text-muted-foreground leading-relaxed">{t('successText')}</p>

        {order && (
          <div className="mt-6 w-full rounded-xl border border-border bg-background p-5 text-left">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <Package className="h-4 w-4 text-gold" />
              <span>Récapitulatif</span>
            </div>
            <ul className="space-y-2 text-sm">
              {order.items.map((item: any, i: number) => (
                <li key={i} className="flex justify-between">
                  <span className="text-muted-foreground">{item.name} × {item.qty}</span>
                  <span className="font-medium">{((item.price * item.qty) / 100).toFixed(2)} €</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-border pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{(order.total / 100).toFixed(2)} €</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span>Confirmation envoyée à {order.contact.email}</span>
            </div>
          </div>
        )}

        <Button asChild variant="gold" className="mt-8 rounded-xl px-8 py-6 text-base shadow-sm hover:shadow-md">
          <Link href="/boutique">{t('backToShop')}</Link>
        </Button>
      </div>
    </section>
  );
}