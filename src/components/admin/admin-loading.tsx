'use client';

import { Loader2 } from 'lucide-react';

export function AdminLoading({ message = 'Chargement…' }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
