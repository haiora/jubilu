import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { POSTS, getPost } from '@/lib/blog';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const post of POSTS) {
      params.push({ locale, slug: post.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params: { slug, locale }
}: {
  params: { slug: string; locale: string };
}): Promise<Metadata> {
  const post = getPost(slug);
  if (!post) return {};
  const activeLocale = (['fr', 'en', 'es', 'he'].includes(locale) ? locale : 'fr') as 'fr' | 'en' | 'es' | 'he';
  const translation = post.translations[activeLocale];
  return { title: translation.title, description: translation.excerpt };
}

export default function BlogPostPage({
  params: { locale, slug }
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  const post = getPost(slug);
  if (!post) notFound();

  const activeLocale = (['fr', 'en', 'es', 'he'].includes(locale) ? locale : 'fr') as 'fr' | 'en' | 'es' | 'he';
  const translation = post.translations[activeLocale];

  // Traduction simple du lien de retour
  const backLabelMap = {
    fr: 'Actualités',
    en: 'News',
    es: 'Actualidades',
    he: 'חדשות'
  };
  const backLabel = backLabelMap[activeLocale];

  return (
    <article className="container py-12">
      <div className="container-prose">
        <Link href="/actualites" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {/* retour */}
          {backLabel}
        </Link>
        <p className="mt-6 eyebrow">{post.date}</p>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{translation.title}</h1>
        <div className="ornament my-8" aria-hidden>✦</div>
        <div className="space-y-5 text-lg leading-relaxed text-foreground/90">
          {translation.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </article>
  );
}