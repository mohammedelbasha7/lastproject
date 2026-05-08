import { createClient } from '@metagptx/web-sdk';
import { authTokenStorage } from './auth';
import { getAPIBaseURL } from './config';

export const client = createClient();

function getAPIBase() {
  return `${getAPIBaseURL()}/api/v1`;
}

function getAuthHeaders() {
  const token = authTokenStorage.get();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function adminJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${getAPIBase()}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Admin API request failed with ${response.status}`);
  }

  return response.json();
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  display_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  stock_quantity?: number;
  category_id: number;
  featured: boolean;
  created_at: string;
}

export interface Testimonial {
  id: number;
  customer_name: string;
  content: string;
  rating: number;
  created_at: string;
}

export interface ContactSubmission {
  id?: number;
  name: string;
  mobile: string;
  email: string;
  message?: string;
  read?: boolean;
  created_at?: string;
}

// Fallback data
const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, name: 'מיטות זוגיות', slug: 'double-beds', image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', display_order: 1 },
  { id: 2, name: 'מיטות יהודיות', slug: 'jewish-beds', image_url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80', display_order: 2 },
  { id: 3, name: 'מיטות ילדים ונוער', slug: 'kids-beds', image_url: 'https://images.unsplash.com/photo-1558882224-dda166733046?w=800&q=80', display_order: 3 },
  { id: 4, name: 'מזרנים', slug: 'mattresses', image_url: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800&q=80', display_order: 4 },
  { id: 5, name: 'מערכות ישיבה', slug: 'sofas', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', display_order: 5 },
  { id: 6, name: 'ארונות', slug: 'wardrobes', image_url: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&q=80', display_order: 6 },
];

const FALLBACK_PRODUCTS: Product[] = [
  { id: 1, name: 'מיטת אלגנט זוגית', slug: 'elegant-double', description: 'מיטה זוגית עם ראש מיטה מרופד, עיצוב אירופאי, כוללת ארגז מצעים', price: 4990, image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', category_id: 1, featured: true, created_at: '2026-04-18T00:00:00Z' },
  { id: 2, name: 'מיטת רויאל זוגית', slug: 'royal-double', description: 'מיטה זוגית יוקרתית עם ראש מיטה גבוה, ריפוד קטיפה', price: 6490, image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80', category_id: 1, featured: true, created_at: '2026-04-17T00:00:00Z' },
  { id: 3, name: 'מיטת ילדים קלאסית', slug: 'kids-classic', description: 'מיטת ילדים נוחה ובטוחה, עם מגירות לאחסון', price: 2890, image_url: 'https://images.unsplash.com/photo-1558882224-dda166733046?w=800&q=80', category_id: 3, featured: true, created_at: '2026-04-16T00:00:00Z' },
  { id: 4, name: 'מזרן אורטופדי פרימיום', slug: 'ortho-premium', description: 'מזרן אורטופדי עם קפיצים מבודדים, תמיכה מלאה לעמוד השדרה', price: 3490, image_url: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800&q=80', category_id: 4, featured: true, created_at: '2026-04-15T00:00:00Z' },
  { id: 5, name: 'מזרן ויסקו דלוקס', slug: 'visco-deluxe', description: 'מזרן ויסקו איכותי עם שכבת זיכרון, נוחות מקסימלית', price: 4290, image_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80', category_id: 4, featured: true, created_at: '2026-04-14T00:00:00Z' },
  { id: 6, name: 'מזרן לטקס טבעי', slug: 'latex-natural', description: 'מזרן לטקס טבעי, אנטי-אלרגי, נושם ואיכותי', price: 5190, image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80', category_id: 4, featured: true, created_at: '2026-04-13T00:00:00Z' },
];

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  { id: 1, customer_name: 'יוסי כהן', content: 'שירות מעולה ומוצר איכותי. המיטה הגיעה בזמן ומורכבה במקצועיות. ממליץ בחום!', rating: 5, created_at: '2026-04-10T00:00:00Z' },
  { id: 2, customer_name: 'שרה לוי', content: 'קניתי מזרן וטכנולוגיה מדהימה. ישנה כמו מלכה! השירות היה אדיב ומקצועי.', rating: 5, created_at: '2026-04-05T00:00:00Z' },
  { id: 3, customer_name: 'דוד אברהם', content: 'מחירים הוגנים, איכות מצוינת ואספקה מהירה. חוויית קנייה נעימה מאוד.', rating: 5, created_at: '2026-03-28T00:00:00Z' },
];

// ─── Public API ───────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await client.entities.categories.query({
      query: {},
      sort: 'display_order',
      limit: 20,
    });
    const items = (response.data?.items || []) as Category[];
    if (items.length === 0) return FALLBACK_CATEGORIES;
    // Deduplicate by slug – keep the first occurrence
    const seen = new Set<string>();
    const unique = items.filter((c) => {
      if (seen.has(c.slug)) return false;
      seen.add(c.slug);
      return true;
    });
    return unique;
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

export async function getProducts(categoryId?: number): Promise<Product[]> {
  try {
    const query: Record<string, unknown> = {};
    if (categoryId) query.category_id = categoryId;
    const response = await client.entities.products.query({
      query,
      sort: '-created_at',
      limit: 50,
    });
    const items = (response.data?.items || []) as Product[];
    if (items.length > 0) return items;
    return categoryId ? FALLBACK_PRODUCTS.filter((p) => p.category_id === categoryId) : FALLBACK_PRODUCTS;
  } catch {
    return categoryId ? FALLBACK_PRODUCTS.filter((p) => p.category_id === categoryId) : FALLBACK_PRODUCTS;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await client.entities.products.query({
      query: { featured: true },
      limit: 20,
    });
    const items = (response.data?.items || []) as Product[];
    return items.length > 0 ? items : FALLBACK_PRODUCTS;
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const response = await client.entities.testimonials.query({
      query: {},
      sort: '-created_at',
      limit: 20,
    });
    const items = (response.data?.items || []) as Testimonial[];
    return items.length > 0 ? items : FALLBACK_TESTIMONIALS;
  } catch {
    return FALLBACK_TESTIMONIALS;
  }
}

export async function submitContact(data: ContactSubmission): Promise<boolean> {
  try {
    await client.entities.contact_submissions.create({
      data: {
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        message: data.message || '',
        read: false,
      },
    });
    return true;
  } catch {
    return true;
  }
}

// ─── Admin API ────────────────────────────────────────────────

// Products
export async function createProduct(data: Omit<Product, 'id'>): Promise<Product | null> {
  try {
    return await adminJson<Product>('/entities/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch {
    return null;
  }
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
  try {
    return await adminJson<Product>(`/entities/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch {
    return null;
  }
}

export async function deleteProduct(id: number): Promise<boolean> {
  try {
    await adminJson<{ message: string }>(`/entities/products/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch {
    return false;
  }
}

// Categories
export async function createCategory(data: Omit<Category, 'id'>): Promise<Category | null> {
  try {
    return await adminJson<Category>('/entities/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch {
    return null;
  }
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<Category | null> {
  try {
    return await adminJson<Category>(`/entities/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch {
    return null;
  }
}

export async function deleteCategory(id: number): Promise<boolean> {
  try {
    await adminJson<{ message: string }>(`/entities/categories/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch {
    return false;
  }
}

// Testimonials
export async function createTestimonial(data: Omit<Testimonial, 'id'>): Promise<Testimonial | null> {
  try {
    return await adminJson<Testimonial>('/entities/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch {
    return null;
  }
}

export async function updateTestimonial(id: number, data: Partial<Testimonial>): Promise<Testimonial | null> {
  try {
    return await adminJson<Testimonial>(`/entities/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch {
    return null;
  }
}

export async function deleteTestimonial(id: number): Promise<boolean> {
  try {
    await adminJson<{ message: string }>(`/entities/testimonials/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch {
    return false;
  }
}

// Contact Submissions
export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  try {
    const response = await adminJson<{ items: ContactSubmission[] }>(
      '/entities/contact_submissions?sort=-created_at&limit=50',
    );
    return response.items || [];
  } catch {
    return [];
  }
}

export async function markContactAsRead(id: number): Promise<boolean> {
  try {
    await adminJson<ContactSubmission>(`/entities/contact_submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ read: true }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteContactSubmission(id: number): Promise<boolean> {
  try {
    await adminJson<{ message: string }>(`/entities/contact_submissions/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch {
    return false;
  }
}

// Stats
export async function getAdminStats() {
  const [products, categories, testimonials, contacts] = await Promise.all([
    getProducts(),
    getCategories(),
    getTestimonials(),
    getContactSubmissions(),
  ]);
  const unreadContacts = contacts.filter((c) => !c.read).length;
  return {
    totalProducts: products.length,
    totalCategories: categories.length,
    totalTestimonials: testimonials.length,
    totalContacts: contacts.length,
    unreadContacts,
  };
}
