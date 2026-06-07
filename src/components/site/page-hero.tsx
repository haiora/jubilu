import { Sparkles } from 'lucide-react';

export function PageHero({
  badge,
  title,
  subtitle
}: {
  badge?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(38_58%_50%_/_0.2),transparent_60%)]" />
      <div className="container relative py-20 text-center">
        {badge && (
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm text-gold">
            <Sparkles className="h-4 w-4" />
            {badge}
          </span>
        )}
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold md:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/85">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
