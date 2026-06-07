// Données de démonstration pour le back-office (CRM, commandes, campagnes).
// TODO : remplacer par des requêtes Cloudflare D1 (Drizzle) une fois la base branchée.

export type OrderStatus = 'pending' | 'paid' | 'prepared' | 'shipped' | 'delivered' | 'cancelled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  paid: 'Payée',
  prepared: 'Préparée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée'
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-blue-100 text-blue-800',
  prepared: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country: string;
  locale: 'fr' | 'en' | 'he' | 'es';
  status: 'lead' | 'client' | 'donateur';
  source: string;
  emailConsent: boolean;
  tags: string[];
  notes: string[];
  createdAt: string;
  ordersCount: number;
  totalSpent: number; // centimes
}

export interface Order {
  id: string;
  number: string;
  contactId: string;
  customer: string;
  email: string;
  status: OrderStatus;
  total: number; // centimes
  currency: 'EUR';
  items: { name: string; qty: number; customText?: string }[];
  country: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent';
  segment: string;
  locale: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  date: string;
}

export const CONTACTS: Contact[] = [
  { id: 'c1', firstName: 'Marie', lastName: 'Lefèvre', email: 'marie.lefevre@example.com', phone: '+33 6 12 34 56 78', country: 'France', locale: 'fr', status: 'client', source: 'Boutique', emailConsent: true, tags: ['VIP', 'Parchemins'], notes: ['Commande un parchemin chaque année pour Noël.'], createdAt: '2025-09-12', ordersCount: 3, totalSpent: 18900 },
  { id: 'c2', firstName: 'David', lastName: 'Roberts', email: 'david.roberts@example.com', country: 'United States', locale: 'en', status: 'donateur', source: 'Newsletter', emailConsent: true, tags: ['Donateur', 'USA'], notes: [], createdAt: '2025-10-01', ordersCount: 1, totalSpent: 8900 },
  { id: 'c3', firstName: 'Sara', lastName: 'Martínez', email: 'sara.martinez@example.com', country: 'España', locale: 'es', status: 'client', source: 'Instagram', emailConsent: true, tags: ['Vins'], notes: ['Préfère les vins rouges.'], createdAt: '2025-11-08', ordersCount: 2, totalSpent: 4980 },
  { id: 'c4', firstName: 'Yossi', lastName: 'Ben-David', email: 'yossi.bd@example.com', country: 'Israel', locale: 'he', status: 'client', source: 'Bouche à oreille', emailConsent: false, tags: ['Israël'], notes: [], createdAt: '2025-11-20', ordersCount: 1, totalSpent: 2490 },
  { id: 'c5', firstName: 'Anna', lastName: 'Klein', email: 'anna.klein@example.com', country: 'Deutschland', locale: 'en', status: 'lead', source: 'Salon', emailConsent: true, tags: ['Prospect'], notes: ['Rencontrée au salon de Jérusalem.'], createdAt: '2026-01-15', ordersCount: 0, totalSpent: 0 },
  { id: 'c6', firstName: 'Paulo', lastName: 'Santos', email: 'paulo.santos@example.com', country: 'Brasil', locale: 'es', status: 'client', source: 'Boutique', emailConsent: true, tags: ['Parchemins'], notes: [], createdAt: '2026-02-02', ordersCount: 1, totalSpent: 8900 }
];

export const ORDERS: Order[] = [
  { id: 'o1', number: 'JBL-1A2B3C', contactId: 'c1', customer: 'Marie Lefèvre', email: 'marie.lefevre@example.com', status: 'delivered', total: 8900, currency: 'EUR', items: [{ name: 'Parchemin personnalisé de Jérusalem', qty: 1, customText: 'Psaume 23' }], country: 'France', createdAt: '2026-05-28' },
  { id: 'o2', number: 'JBL-4D5E6F', contactId: 'c3', customer: 'Sara Martínez', email: 'sara.martinez@example.com', status: 'shipped', total: 2490, currency: 'EUR', items: [{ name: 'Vin rouge de Galilée', qty: 1 }], country: 'España', createdAt: '2026-06-01' },
  { id: 'o3', number: 'JBL-7G8H9I', contactId: 'c2', customer: 'David Roberts', email: 'david.roberts@example.com', status: 'paid', total: 8900, currency: 'EUR', items: [{ name: 'Parchemin personnalisé de Jérusalem', qty: 1, customText: 'For God so loved the world' }], country: 'United States', createdAt: '2026-06-05' },
  { id: 'o4', number: 'JBL-0J1K2L', contactId: 'c4', customer: 'Yossi Ben-David', email: 'yossi.bd@example.com', status: 'pending', total: 2490, currency: 'EUR', items: [{ name: 'Vin rouge de Galilée', qty: 1 }], country: 'Israel', createdAt: '2026-06-06' },
  { id: 'o5', number: 'JBL-3M4N5O', contactId: 'c6', customer: 'Paulo Santos', email: 'paulo.santos@example.com', status: 'prepared', total: 8900, currency: 'EUR', items: [{ name: 'Parchemin personnalisé de Jérusalem', qty: 1, customText: 'Shalom' }], country: 'Brasil', createdAt: '2026-06-07' },
  { id: 'o6', number: 'JBL-6P7Q8R', contactId: 'c1', customer: 'Marie Lefèvre', email: 'marie.lefevre@example.com', status: 'paid', total: 4780, currency: 'EUR', items: [{ name: 'Vin blanc de Judée', qty: 1 }, { name: 'Vin rosé de Sharon', qty: 1 }], country: 'France', createdAt: '2026-06-07' }
];

export const CAMPAIGNS: Campaign[] = [
  { id: 'm1', name: 'Newsletter de juin', subject: 'Des nouvelles de Jérusalem 🕊️', status: 'sent', segment: 'Tous les contacts', locale: 'fr', sent: 8520, delivered: 8395, opened: 4120, clicked: 980, unsubscribed: 22, bounced: 125, date: '2026-06-02' },
  { id: 'm2', name: 'Lancement parchemins', subject: 'Votre héritage, écrit à la main', status: 'sent', segment: 'Clients vins', locale: 'fr', sent: 1240, delivered: 1230, opened: 760, clicked: 210, unsubscribed: 3, bounced: 10, date: '2026-05-20' },
  { id: 'm3', name: 'Pâque / Pessah', subject: 'A blessing for the season', status: 'scheduled', segment: 'Contacts EN/HE', locale: 'en', sent: 0, delivered: 0, opened: 0, clicked: 0, unsubscribed: 0, bounced: 0, date: '2026-06-15' },
  { id: 'm4', name: 'Campagne dons été', subject: 'Soutenez la mission cet été', status: 'draft', segment: 'Donateurs', locale: 'fr', sent: 0, delivered: 0, opened: 0, clicked: 0, unsubscribed: 0, bounced: 0, date: '—' }
];

export function formatEUR(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export function dashboardStats() {
  const revenue = ORDERS.filter((o) => o.status !== 'cancelled' && o.status !== 'pending').reduce((s, o) => s + o.total, 0);
  const byStatus = ORDERS.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);
  const avgCart = ORDERS.length ? Math.round(ORDERS.reduce((s, o) => s + o.total, 0) / ORDERS.length) : 0;
  const sentCampaigns = CAMPAIGNS.filter((c) => c.status === 'sent');
  const totalSent = sentCampaigns.reduce((s, c) => s + c.sent, 0);
  const totalOpened = sentCampaigns.reduce((s, c) => s + c.opened, 0);
  const openRate = totalSent ? Math.round((totalOpened / totalSent) * 100) : 0;
  return {
    revenue,
    ordersCount: ORDERS.length,
    byStatus,
    avgCart,
    contactsCount: CONTACTS.length,
    newContacts: CONTACTS.filter((c) => c.createdAt >= '2026-01-01').length,
    openRate,
    totalSent
  };
}

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  entity: string;
  at: string;
}

export const AUDIT_LOGS: AuditEntry[] = [
  { id: 'a1', user: 'Direction Jubilé', action: 'Connexion', entity: 'session', at: '2026-06-07 09:12' },
  { id: 'a2', user: 'Équipe Boutique', action: 'Statut commande → expédiée', entity: 'JBL-4D5E6F', at: '2026-06-07 08:40' },
  { id: 'a3', user: 'Équipe CRM', action: 'Note ajoutée', entity: 'Contact Marie Lefèvre', at: '2026-06-06 17:22' },
  { id: 'a4', user: 'Équipe Marketing', action: 'Campagne envoyée', entity: 'Newsletter de juin', at: '2026-06-02 10:05' },
  { id: 'a5', user: 'Direction Jubilé', action: 'Produit créé', entity: 'Vin rosé de Sharon', at: '2026-05-30 14:18' }
];

export function getContact(id: string): Contact | undefined {
  return CONTACTS.find((c) => c.id === id);
}

export function ordersForContact(id: string): Order[] {
  return ORDERS.filter((o) => o.contactId === id);
}
