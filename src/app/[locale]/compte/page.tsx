export const runtime = 'edge';

'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { LogIn, LogOut, Package, User, ScrollText, ChevronRight, Loader2, Star, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

type OrderStatus = 'pending' | 'paid' | 'prepared' | 'shipped' | 'delivered' | 'cancelled';

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   'bg-amber-100 text-amber-800',
  paid:      'bg-blue-100 text-blue-800',
  prepared:  'bg-indigo-100 text-indigo-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};


interface ClientOrder {
  id: string;
  number: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: { name: string; qty: number; customText?: string | null }[];
}

interface ClientContact {
  firstName: string | null;
  lastName: string | null;
  email: string;
  status: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

export default function AccountPage() {
  const t = useTranslations('account');
  const tAdmin = useTranslations('admin');
  const locale = useLocale();
  const formatEUR = (cents: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(cents / 100);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contact, setContact] = useState<ClientContact | null>(null);
  const [orders, setOrders] = useState<ClientOrder[]>([]);

  const field = 'h-12 w-full rounded-xl border border-white/20 bg-background/50 px-4 text-sm outline-none ring-gold focus:ring-2 focus:bg-background/80 transition-all backdrop-blur-sm';

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/client/account?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t('notFound'));
      setContact(data.contact);
      setOrders(data.orders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSignOut() {
    setContact(null);
    setOrders([]);
    setEmail('');
  }

  if (!contact) {
    return (
      <section className="relative min-h-[85vh] flex items-center justify-center py-16">
        <div className="absolute inset-0 z-0">
          <Image src="/images/hero-jerusalem.png" alt="Background" fill className="object-cover opacity-40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/90 via-foreground/80 to-background/90 backdrop-blur-sm" />
        </div>

        <div className="container relative z-10 mx-auto max-w-md animate-fade-up">
          <div className="glass rounded-[2rem] border border-white/10 p-10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="ornament mb-6" aria-hidden>✦</div>
              <h1 className="font-serif text-3xl font-semibold text-white drop-shadow-sm">{t('signInTitle')}</h1>
              <p className="mt-2 text-white/60">{t('subtitle')}</p>
            </div>
            
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">{t('emailLabel')}</label>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className={field} 
                  placeholder="votre@email.com"
                  autoComplete="email"
                />
              </div>
              {error && (
                <div className="rounded-xl bg-red-900/30 border border-red-500/30 px-4 py-2.5 text-sm text-red-300">
                  {error}
                </div>
              )}
              <Button type="submit" variant="gold" size="lg" className="w-full h-12 text-base shadow-[0_0_20px_-5px_hsl(var(--gold))] hover:shadow-[0_0_30px_-5px_hsl(var(--gold))]" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                {loading ? t('verifying') : t('signIn')}
              </Button>
            </form>
            
            <div className="mt-8 rounded-xl bg-black/20 border border-white/5 p-4 text-xs text-white/50 text-center">
              {t('accountHint')}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const memberSince = new Date(contact.createdAt).getFullYear();
  const statusLabel = contact.status === 'donateur' ? t('statusDonor') : contact.status === 'client' ? t('statusClient') : t('statusMember');

  return (
    <section className="min-h-screen bg-background/50">
      <div className="bg-foreground text-primary-foreground py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/10 to-transparent" />
        <div className="container relative flex flex-wrap items-center justify-between gap-4 z-10">
          <div>
            <h1 className="font-serif text-4xl font-semibold">{t('title')}</h1>
            <p className="text-primary-foreground/70 mt-2 text-lg">
              {t('welcome')}, <span className="text-gold font-medium">{contact.firstName ?? email}</span>
            </p>
          </div>
          <Button variant="outline" className="border-white/20 glass text-white hover:bg-white/10" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> {t('logout')}
          </Button>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile sidebar */}
          <div className="space-y-4 self-start sticky top-24">
            <div className="card-elevated p-8">
              <h2 className="flex items-center gap-3 font-semibold text-xl mb-6 pb-4 border-b border-border/50">
                <div className="p-2 bg-accent text-primary rounded-lg"><User className="h-5 w-5" /></div>
                {t('profile')}
              </h2>
              <div className="space-y-4">
                {(contact.firstName || contact.lastName) && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{t('fieldName')}</p>
                    <p className="text-foreground font-medium">{contact.firstName} {contact.lastName}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{t('fieldEmail')}</p>
                  <p className="text-foreground font-medium">{contact.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{t('fieldStatus')}</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-sm font-medium text-gold border border-gold/20">
                    <Crown className="h-3.5 w-3.5" /> {statusLabel}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{t('memberSince')}</p>
                  <p className="text-foreground">{memberSince}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="card-elevated p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Star className="h-4 w-4 text-gold" /> {t('myBalance')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('ordersCountLabel')}</span>
                  <span className="font-semibold">{contact.ordersCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('totalSpent')}</span>
                  <span className="font-semibold text-gold">{formatEUR(contact.totalSpent)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 flex items-center gap-3 font-semibold text-2xl">
              <Package className="h-6 w-6 text-gold" /> {t('myOrders')}
            </h2>
            
            {orders.length === 0 ? (
              <div className="card-elevated p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg text-muted-foreground">{t('noOrders')}</p>
                <Button variant="outline" className="mt-6 text-primary border-primary/20" asChild>
                  <a href="/boutique">{t('exploreShop')}</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((o) => (
                  <div key={o.id} className="card-elevated p-0 overflow-hidden group">
                    <div className="flex flex-wrap items-center justify-between bg-accent/20 p-6 border-b border-border/50">
                      <div>
                        <span className="font-mono text-sm text-muted-foreground">{t('orderLabel')} #{o.number}</span>
                        <p className="font-medium mt-1">{new Date(o.createdAt).toLocaleDateString(locale)}</p>
                      </div>
                      <span className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${ORDER_STATUS_COLORS[o.status]}`}>
                        {tAdmin(`status.${o.status}`)}
                      </span>
                    </div>
                    
                    <div className="p-6">
                      <ul className="space-y-4">
                        {o.items.map((it, i) => (
                          <li key={i} className="flex items-start justify-between gap-4">
                            <div className="flex gap-4">
                              <div className="h-12 w-12 rounded-xl bg-accent/50 flex items-center justify-center text-primary font-medium shrink-0">
                                {it.qty}x
                              </div>
                              <div>
                                <p className="font-medium">{it.name}</p>
                                {it.customText && (
                                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-accent/30 px-2.5 py-1 rounded-md">
                                    <ScrollText className="h-3.5 w-3.5 text-gold" /> 
                                    <span className="italic">« {it.customText} »</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                        <Button variant="link" className="text-primary p-0 h-auto font-medium">
                          {t('viewInvoice')} <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">{t('totalIncl')}</p>
                          <p className="text-2xl font-semibold text-foreground">{formatEUR(o.total)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}