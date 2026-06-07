import { cookies } from 'next/headers';

// auth.ts - Session management and roles

export type Role =
  | 'super_admin'
  | 'admin'
  | 'shop'
  | 'crm'
  | 'content'
  | 'marketing'
  | 'support';

export type Permission =
  | 'dashboard'
  | 'orders'
  | 'stock'
  | 'products'
  | 'crm'
  | 'clients'
  | 'campaigns'
  | 'settings';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ['dashboard', 'orders', 'stock', 'products', 'crm', 'clients', 'campaigns', 'settings'],
  admin: ['dashboard', 'orders', 'stock', 'products', 'crm', 'clients', 'campaigns', 'settings'],
  shop: ['dashboard', 'orders', 'stock', 'products'],
  crm: ['dashboard', 'crm', 'clients'],
  content: ['dashboard', 'products'],
  marketing: ['dashboard', 'campaigns', 'crm'],
  support: ['dashboard', 'orders', 'crm']
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super administrateur',
  admin: 'Administrateur',
  shop: 'Gestion boutique',
  crm: 'Gestion CRM',
  content: 'Gestion contenu',
  marketing: 'Gestion marketing',
  support: 'Support'
};

const COOKIE = 'jbl_session';

export interface Session {
  email: string;
  name: string;
  role: Role;
}

export function encodeSession(s: Session): string {
  return Buffer.from(JSON.stringify(s)).toString('base64');
}

export function decodeSession(value: string | undefined): Session | null {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as Session;
  } catch {
    return null;
  }
}

export function getSession(): Session | null {
  return decodeSession(cookies().get(COOKIE)?.value);
}

export function can(session: Session | null, permission: Permission): boolean {
  if (!session) return false;
  return ROLE_PERMISSIONS[session.role]?.includes(permission) ?? false;
}

export const SESSION_COOKIE = COOKIE;
