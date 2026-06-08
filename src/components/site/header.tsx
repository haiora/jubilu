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
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-xl shadow-sm transition-all duration-300">
      <div className="container flex h-[72px] items-center justify-between gap-3">
        <Logo className="shrink-0" />

        <nav className="hidden items-center gap-5 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-gold',
                isActive(item.href) ? 'text-gold' : 'text-foreground'
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
            className="hidden h-9 w-9 items-center justify-center rounded-full hover:bg-accent sm:inline-flex"
          >
            <User className="h-[18px] w-[18px]" />
          </Link>
          <Link
            href="/panier"
            aria-label={t('cart')}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {count > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-gold-foreground">
                {count}
              </span>
            )}
          </Link>
          <Button asChild size="sm" variant="gold" className="hidden sm:inline-flex">
            <Link href="/boutique">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden md:inline">{t('shop')}</span>
            </Link>
          </Button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent xl:hidden"
            aria-label={tc('menu')}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'xl:hidden overflow-hidden border-t border-border/60 bg-background shadow-lg transition-all',
          open ? 'max-h-[520px]' : 'max-h-0'
        )}
      >
        <nav className="container flex flex-col gap-1 py-4">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-accent',
                isActive(item.href) ? 'text-gold' : 'text-foreground'
              )}
            >
              {t(item.key)}
            </Link>
          ))}
          <div className="mt-2 border-t border-border/60 pt-3 sm:hidden">
            <Button asChild size="sm" variant="gold" className="w-full justify-center">
              <Link href="/boutique">
                <ShoppingBag className="h-4 w-4 mr-2" />
                {t('shop')}
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
