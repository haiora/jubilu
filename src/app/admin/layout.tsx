'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminLoading } from '@/components/admin/admin-loading';

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
      <div className="min-h-screen bg-stone-50">
        <AdminLoading message="Vérification de l'accès…" />
      </div>
    );
  }

  return <>{children}</>;
}
