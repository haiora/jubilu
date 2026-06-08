import { redirect } from 'next/navigation';
import { getSession, ROLE_PERMISSIONS } from '@/lib/auth';
import { Sidebar } from '@/components/admin/sidebar';

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar
        name={session.name}
        role={session.role}
        permissions={ROLE_PERMISSIONS[session.role]}
      />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
