'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Package,
  Users,
  Mail,
  Settings,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { Permission, Role } from '@/lib/auth';
import { AdminLanguageSwitcher } from './admin-language-switcher';

const NAV: { href: string; navKey: string; icon: typeof LayoutDashboard; perm: Permission }[] = [
  { href: '/admin', navKey: 'dashboard', icon: LayoutDashboard, perm: 'dashboard' },
  { href: '/admin/commandes', navKey: 'orders', icon: ShoppingCart, perm: 'orders' },
  { href: '/admin/produits', navKey: 'products', icon: Package, perm: 'products' },
  { href: '/admin/stock', navKey: 'stock', icon: Boxes, perm: 'stock' },
  { href: '/admin/crm', navKey: 'crm', icon: Users, perm: 'crm' },
  { href: '/admin/campagnes', navKey: 'campaigns', icon: Mail, perm: 'campaigns' },
  { href: '/admin/parametres', navKey: 'settings', icon: Settings, perm: 'settings' }
];

export function Sidebar({
  name,
  role,
  permissions
}: {
  name: string;
  role: Role;
  permissions: Permission[];
}) {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  const items = NAV.filter((n) => permissions.includes(n.perm));

  return (
    <aside className="flex w-64 shrink-0 flex-col border-e border-border bg-primary text-primary-foreground">
      <div className="border-b border-primary-foreground/15 p-6">
        <span className="font-serif text-2xl font-semibold">Jubilé</span>
        <p className="text-xs text-primary-foreground/70">{t('common.administration')}</p>
        <div className="mt-3"><AdminLanguageSwitcher /></div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-gold text-gold-foreground' : 'text-primary-foreground/85 hover:bg-primary-foreground/10'
              )}
            >
              <Icon className="h-5 w-5" />
              {t(`nav.${item.navKey}`)}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-primary-foreground/15 p-4">
        <a href="/" target="_blank" className="mb-3 flex items-center gap-2 text-xs text-primary-foreground/70 hover:text-gold">
          <ExternalLink className="h-4 w-4" /> {t('common.viewSite')}
        </a>
        <div className="rounded-xl bg-primary-foreground/10 p-3">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="text-xs text-primary-foreground/70">{t(`roles.${role}`)}</p>
          <button onClick={logout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-foreground/15 py-2 text-xs hover:bg-primary-foreground/25">
            <LogOut className="h-4 w-4" /> {t('common.logout')}
          </button>
        </div>
      </div>
    </aside>
  );
}
