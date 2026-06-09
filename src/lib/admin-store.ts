/* Admin localStorage store — works without backend for static export */

export interface AdminContact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
  status: 'client' | 'lead' | 'donateur';
  tags?: string[];
  consent?: boolean;
  totalSpent: number;
  ordersCount: number;
  createdAt: string;
  notes?: string;
}

export interface AdminOrderItem {
  name: string;
  qty: number;
  price: number;
  customText?: string | null;
}

export interface AdminOrder {
  id: string;
  number: string;
  status: 'pending' | 'paid' | 'prepared' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  date: string;
  contact: { firstName?: string; lastName?: string; email: string; phone?: string; address?: string };
  items: AdminOrderItem[];
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku?: string;
  status: 'active' | 'draft' | 'archived';
}

/* ─── Keys ─── */
const ORDERS_KEY = 'jubilee_orders';
const CONTACTS_KEY = 'jubilee_contacts';
const DONATIONS_KEY = 'jubilee_donations';

/* ─── Helpers ─── */
function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}
function write<T>(key: string, value: T) {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(value));
}

/* ─── Orders ─── */
export function getOrders(): AdminOrder[] {
  return read<AdminOrder[]>(ORDERS_KEY, []);
}
export function addOrder(order: AdminOrder) {
  const all = getOrders();
  all.push(order);
  write(ORDERS_KEY, all);
  // Auto-create / update contact
  syncContactFromOrder(order);
}
export function updateOrderStatus(id: string, status: AdminOrder['status']) {
  const all = getOrders().map((o) => (o.id === id || o.number === id ? { ...o, status } : o));
  write(ORDERS_KEY, all);
}

/* ─── Contacts ─── */
export function getContacts(): AdminContact[] {
  return read<AdminContact[]>(CONTACTS_KEY, []);
}
export function addContact(c: AdminContact) {
  const all = getContacts();
  all.push(c);
  write(CONTACTS_KEY, all);
}
export function updateContact(id: number, patch: Partial<AdminContact>) {
  const all = getContacts().map((c) => (c.id === id ? { ...c, ...patch } : c));
  write(CONTACTS_KEY, all);
}
export function deleteContact(id: number) {
  write(CONTACTS_KEY, getContacts().filter((c) => c.id !== id));
}
function syncContactFromOrder(order: AdminOrder) {
  const all = getContacts();
  const email = order.contact.email.toLowerCase();
  const idx = all.findIndex((c) => c.email.toLowerCase() === email);
  const name = `${order.contact.firstName || ''} ${order.contact.lastName || ''}`.trim() || email;
  if (idx >= 0) {
    all[idx].ordersCount = (all[idx].ordersCount || 0) + 1;
    all[idx].totalSpent = (all[idx].totalSpent || 0) + (order.total || 0);
    all[idx].name = name || all[idx].name;
    if (order.contact.phone) all[idx].phone = order.contact.phone;
    if (order.contact.address) all[idx].address = order.contact.address;
  } else {
    all.push({
      id: Date.now(),
      name,
      email: order.contact.email,
      phone: order.contact.phone,
      address: order.contact.address,
      status: 'client',
      totalSpent: order.total || 0,
      ordersCount: 1,
      createdAt: order.date || new Date().toISOString(),
    });
  }
  write(CONTACTS_KEY, all);
}

/* ─── Donations ─── */
export function getDonations() {
  return read<any[]>(DONATIONS_KEY, []);
}

/* ─── Stats ─── */
export function getStats() {
  const orders = getOrders();
  const contacts = getContacts();
  const donations = getDonations();
  return {
    orders: orders.length,
    clients: contacts.length,
    products: 4,
    revenue: orders.reduce((s, o) => s + (o.total || 0), 0),
    donationsCount: donations.length,
    donationsTotal: donations.reduce((s, d) => s + (d.amount || 0), 0),
  };
}
