'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, LockKeyhole } from 'lucide-react';

const ADMIN_CREDS = { email: 'admin@jubilee-israel.org', password: 'admin123' };

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_CREDS.email && password === ADMIN_CREDS.password) {
      localStorage.setItem('admin_token', 'mock-admin-token');
      localStorage.setItem('admin_user', JSON.stringify({ email, name: 'Administrateur' }));
      router.replace('/admin/');
    } else {
      setError('Identifiants incorrects');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2 text-primary">
          <LockKeyhole className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Admin Jubilé</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              placeholder="admin@jubilee-israel.org"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2"
              placeholder="admin123"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            <LogIn className="h-4 w-4" /> Connexion
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Démo : admin@jubilee-israel.org / admin123
        </p>
      </div>
    </div>
  );
}
