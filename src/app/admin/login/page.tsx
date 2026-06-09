'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, LockKeyhole, Crown } from 'lucide-react';
import { adminLogin } from '@/lib/api-client';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(email, password);
      router.replace('/admin/');
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  const field = 'h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white outline-none ring-gold focus:ring-2 focus:bg-white/15 transition-all placeholder:text-white/40';

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-foreground">
      <div className="absolute inset-0 z-0">
        <Image src="/images/hero-jerusalem.png" alt="" fill className="object-cover opacity-20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/95 via-foreground/90 to-background/95 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="glass rounded-[2rem] border border-white/10 p-10 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/20">
              <Crown className="h-7 w-7 text-gold" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-white">Admin Jubilé</h1>
            <p className="mt-1 text-sm text-white/50">Espace de gestion sécurisé</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
                placeholder="admin@jubilee-israel.org"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-900/30 border border-red-500/30 px-4 py-2.5 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 text-sm font-semibold text-foreground shadow-[0_0_20px_-5px_hsl(var(--gold))] hover:shadow-[0_0_30px_-5px_hsl(var(--gold))] disabled:opacity-50 transition-all"
            >
              <LogIn className="h-4 w-4" /> {loading ? 'Connexion…' : 'Connexion'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-white/30">
            Jubilé Israel — Administration
          </div>
        </div>
      </div>
    </div>
  );
}
