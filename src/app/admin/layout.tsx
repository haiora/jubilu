'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login/') {
      setChecked(true);
      return;
    }
    fetch('/api/admin/me/')
      .then((res) => {
        if (!res.ok) {
          router.replace('/admin/login/');
        }
      })
      .catch(() => router.replace('/admin/login/'))
      .finally(() => setChecked(true));
  }, [router, pathname]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
