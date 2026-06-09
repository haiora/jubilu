// API client for Jubilé platform
// Handles admin and public API calls with error handling

const API_BASE = '';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      body.error || `HTTP ${res.status}`,
      res.status,
      body.code
    );
  }

  return res.json() as Promise<T>;
}

// ===================== ADMIN =====================

export async function adminLogin(email: string, password: string) {
  return fetchJson<{ ok: boolean; role: string }>('/api/admin/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function adminLogout() {
  return fetchJson<{ ok: boolean }>('/api/admin/logout/', { method: 'POST' });
}

export interface DashboardStats {
  orders: number;
  clients: number;
  products: number;
  revenue: number;
  donationsCount: number;
  donationsTotal: number;
}

export async function getAdminDashboard(): Promise<{
  stats: DashboardStats;
  recentOrders: any[];
  recentClients: any[];
}> {
  // For now compose from individual endpoints until a dedicated dashboard API exists
  const [orders, contacts] = await Promise.all([
    getAdminOrders(),
    getAdminContacts(),
  ]);
  const revenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  return {
    stats: {
      orders: orders.length,
      clients: contacts.length,
      products: 4,
      revenue,
      donationsCount: 0,
      donationsTotal: 0,
    },
    recentOrders: orders.slice(0, 5),
    recentClients: contacts.slice(0, 5),
  };
}

export async function getAdminOrders(): Promise<any[]> {
  return fetchJson<any[]>('/api/admin/orders/');
}

export async function updateOrderStatus(orderId: string, status: string) {
  return fetchJson<{ ok: boolean; status: string }>('/api/admin/orders/status/', {
    method: 'POST',
    body: JSON.stringify({ orderId, status }),
  });
}

export async function getAdminContacts(): Promise<any[]> {
  return fetchJson<any[]>('/api/admin/contacts/');
}

export async function getAdminProducts(): Promise<any[]> {
  return fetchJson<any[]>('/api/admin/products/');
}

export async function createAdminProduct(body: Record<string, unknown>) {
  return fetchJson<{ ok: boolean; id: string; slug: string }>('/api/admin/products/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateAdminStock(variantId: string, delta: number, reason?: string) {
  return fetchJson<{ ok: boolean; stock: number }>('/api/admin/stock/', {
    method: 'POST',
    body: JSON.stringify({ variantId, delta, reason }),
  });
}

export async function getAdminCampaigns(): Promise<any[]> {
  return fetchJson<any[]>('/api/admin/campaigns/');
}

export async function createCampaign(body: Record<string, unknown>) {
  return fetchJson<{ ok: boolean; id: string; message: string }>('/api/admin/campaigns/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ===================== PUBLIC =====================

export async function submitContact(form: {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  message?: string;
  country?: string;
  locale?: string;
}) {
  return fetchJson<{ ok: boolean }>('/api/contact/', {
    method: 'POST',
    body: JSON.stringify(form),
  });
}

export async function subscribeNewsletter(email: string, locale?: string) {
  return fetchJson<{ ok: boolean }>('/api/newsletter/', {
    method: 'POST',
    body: JSON.stringify({ email, locale }),
  });
}

export async function createOrder(body: Record<string, unknown>) {
  return fetchJson<{ ok: boolean; url: string; orderNumber: string }>('/api/orders/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getClientAccount(email: string): Promise<any[]> {
  const url = new URL('/api/client/account/', window.location.origin);
  url.searchParams.set('email', email);
  return fetchJson<any[]>(url.pathname + url.search);
}
