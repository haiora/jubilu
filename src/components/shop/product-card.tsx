import { Wine, ScrollText, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { formatPrice, type Product } from '@/lib/catalog';
import type { Locale } from '@/i18n/routing';

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const tr = product.translations[locale];
  const Icon = product.icon === 'scroll' ? ScrollText : Wine;

  return (
    <Link
      href={`/boutique/${product.category}/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className={`relative flex h-52 items-center justify-center bg-gradient-to-br ${product.gradient}`}>
        {product.image ? (
          <Image src={product.image} alt={tr.name} fill className="object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-background/80 text-primary shadow-sm">
            <Icon className="h-9 w-9" />
          </div>
        )}
        {product.featured && (
          <span className="absolute end-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-gold-foreground">
            ★
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold leading-snug">{tr.name}</h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{tr.short}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-primary">{formatPrice(product.price, locale)}</span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
