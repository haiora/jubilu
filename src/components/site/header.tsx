'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { Logo } from './logo';
import { LanguageSwitcher } from './language-switcher';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/shop/cart-context';
import { cn } from '@/lib/utils';

const NAV = [
  { key: 'about', href: '/a-propos' },
  { key: 'mission', href: '/mission' },
  { key: 'shop', href: '/boutique' },
  { key: 'parchments', href: '/boutique/parchemins' },
  { key: 'testimonials', href: '/temoignages' },
  { key: 'news', href: '/actualites' },
  { key: 'contact', href: '/contact' }
] as const;

export function Header() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const { count } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-white/20 bg-background/70 backdrop-blur-xl shadow-sm transition-all duration-300">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                isActive(item.href) ? 'text-primary' : 'text-foreground/80'
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href="/compte"
            aria-label={t('account')}
            className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-accent sm:inline-flex"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href="/panier"
            aria-label={t('cart')}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-xs font-semibold text-gold-foreground">
                {count}
              </span>
            )}
          </Link>
          <Button asChild size="sm" variant="gold" className="hidden sm:inline-flex">
            <Link href="/boutique">
              <ShoppingBag className="h-4 w-4" />
              {t('shop')}
            </Link>
          </Button>
          <button
            type="button"
            className="lg:hidden"
            aria-label={tc('menu')}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'lg:hidden overflow-hidden border-t border-border/60 transition-all',
          open ? 'max-h-[480px]' : 'max-h-0'
        )}
      >
        <nav className="container flex flex-col gap-1 py-4">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-base font-medium hover:bg-accent"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
