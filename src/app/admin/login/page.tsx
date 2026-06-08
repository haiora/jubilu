'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LogIn, Loader2, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function AdminLoginPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [email, setEmail] = useState('admin@jubilee-israel.org');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('invalid');
      router.push('/admin');
      router.refresh();
    } catch {
      setError(t('login.error'));
      setLoading(false);
    }
  }

  const field = 'h-12 w-full rounded-xl border border-white/20 bg-background/50 px-4 text-sm outline-none ring-gold focus:ring-2 focus:bg-background/80 transition-all backdrop-blur-sm';

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-foreground">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/wine-red-1.png" alt="Admin Background" fill className="object-cover opacity-30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/90 to-background/50 backdrop-blur-md" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="glass rounded-[2.5rem] border border-white/10 p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 border border-gold/20 text-gold shadow-inner">
              <LockKeyhole className="h-8 w-8" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-white tracking-wide">{t('common.administration')}</h1>
            <p className="mt-2 text-white/60">{t('login.subtitle')}</p>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">{t('login.email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">{t('login.password')}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} required />
            </div>
            
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center text-sm text-red-400">
                {error}
              </div>
            )}
            
            <Button type="submit" variant="gold" size="lg" className="w-full h-12 mt-2 shadow-[0_0_20px_-5px_hsl(var(--gold))] hover:shadow-[0_0_30px_-5px_hsl(var(--gold))]" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
              {t('login.signIn')}
            </Button>
          </form>
          
          <div className="mt-8 rounded-xl bg-black/30 border border-white/5 p-4 text-center text-xs text-white/50 leading-relaxed">
            {t('login.securedAccess')}<br/>
            {t('login.demoHint', { email: 'admin@jubilee-israel.org', password: 'admin123' })}
          </div>
        </div>
      </div>
    </div>
  );
}
