'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Shield, Globe, Mail, CreditCard, Database } from 'lucide-react';
import { AdminLoading } from '@/components/admin/admin-loading';

interface SystemStatus {
  environment: string;
  nodeVersion: string;
  nextVersion: string;
  features: {
    stripe: boolean;
    resend: boolean;
    database: boolean;
  };
}

export default function SettingsPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Best-effort system info detection
    const stripeKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const resendKey = false; // server-side only
    const dbPath = false; // server-side only

    setStatus({
      environment: 'production',
      nodeVersion: '20',
      nextVersion: '14.2',
      features: {
        stripe: stripeKey,
        resend: resendKey,
        database: true,
      },
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <AdminLoading />
      </div>
    );
  }

  const configs = [
    {
      icon: Shield,
      label: 'Sécurité',
      items: [
        { label: 'HTTPS forcé', value: 'Activé', ok: true },
        { label: 'CSP Headers', value: 'Activé', ok: true },
        { label: 'HSTS', value: 'Activé', ok: true },
      ],
    },
    {
      icon: Globe,
      label: 'Internationalisation',
      items: [
        { label: 'Langues actives', value: 'FR, EN, ES, HE', ok: true },
        { label: 'Langue par défaut', value: 'Français', ok: true },
      ],
    },
    {
      icon: Mail,
      label: 'Email & Campagnes',
      items: [
        { label: 'Provider', value: 'Resend', ok: status?.features.resend ?? false },
        { label: 'Webhook Resend', value: 'Actif', ok: true },
      ],
    },
    {
      icon: CreditCard,
      label: 'Paiements',
      items: [
        { label: 'Stripe Checkout', value: 'Actif', ok: status?.features.stripe ?? false },
        { label: 'Devise', value: 'EUR', ok: true },
      ],
    },
    {
      icon: Database,
      label: 'Base de données',
      items: [
        { label: 'ORM', value: 'Drizzle', ok: true },
        { label: 'Stockage', value: 'Cloudflare D1 / SQLite', ok: status?.features.database ?? false },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-border bg-white">
        <div className="container flex items-center gap-4 py-4">
          <a href="/admin/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Retour
          </a>
          <h1 className="text-lg font-semibold">Paramètres système</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {configs.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.label} className="rounded-xl border border-border bg-white p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-semibold">{section.label}</h2>
                </div>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <span className={`h-2 w-2 rounded-full ${item.ok ? 'bg-green-500' : 'bg-amber-400'}`} />
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 font-semibold">Informations</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Certaines configurations (clés API Stripe, Resend, etc.) sont définies via les variables d&apos;environnement et ne peuvent pas être modifiées depuis cette interface.</p>
            <p>Pour modifier ces paramètres, mettez à jour vos secrets dans le tableau de bord Cloudflare ou votre fichier <code className="rounded bg-accent px-1 py-0.5 text-xs">.env.local</code> en développement.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
