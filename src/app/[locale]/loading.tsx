import { Loader2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function Loading() {
  const t = await getTranslations('common');
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <Loader2 className="h-10 w-10 animate-spin text-gold mb-4" />
      <p className="text-muted-foreground animate-pulse">{t('loading')}</p>
    </div>
  );
}
