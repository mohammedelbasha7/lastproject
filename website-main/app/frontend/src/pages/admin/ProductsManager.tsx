import { useState, useEffect } from 'react';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
  type Category,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, X, Save, Image } from 'lucide-react';
import { toast } from 'sonner';

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  image_url: string;
  category_id: string;
  featured: boolean;
}

const emptyForm: ProductForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  image_url: '',
  category_id: '',
  featured: false,
};

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      price: String(p.price),
      image_url: p.image_url || '',
      category_id: String(p.category_id),
      featured: p.featured,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category_id) {
      toast.error('נא למלא את כל השדות הנדרשים');
      return;
    }
    setSaving(true);
    const data = {
      name: form.name,
      slug: form.slug || form.name.replace(/\s+/g, '-').toLowerCase(),
      description: form.description,
      price: parseInt(form.price, 10),
      image_url: form.image_url,
      category_id: parseInt(form.category_id, 10),
      featured: form.featured,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    if (editingId) {
      const result = await updateProduct(editingId, data);
      if (result) {
        toast.success('המוצר עודכן בהצלחה');
      } else {
        toast.error('שגיאה בעדכון המוצר');
      }
    } else {
      const result = await createProduct(data);
      if (result) {
        toast.success('המוצר נוצר בהצלחה');
      } else {
        toast.error('שגיאה ביצירת המוצר');
      }
    }
    setSaving(false);
    setShowForm(false);
    await loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) return;
    const result = await deleteProduct(id);
    if (result) {
      toast.success('המוצר נמחק בהצלחה');
      await loadData();
    } else {
      toast.error('שגיאה במחיקת המוצר');
    }
  };

  const getCategoryName = (catId: number) => {
    return categories.find((c) => c.id === catId)?.name || 'לא ידוע';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ניהול מוצרים</h1>
        <Button onClick={openCreate} className="bg-gold hover:bg-gold/90 text-white">
          <Plus className="w-4 h-4 ml-2" />
          הוסף מוצר
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{editingId ? 'עריכת מוצר' : 'מוצר חדש'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם המוצר *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="שם המוצר" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="product-slug" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="תיאור המוצר"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gold min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">מחיר (₪) *</label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה *</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gold bg-white"
                  >
                    <option value="">בחר קטגוריה</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">קישור לתמונה</label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." dir="ltr" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                />
                <label htmlFor="featured" className="text-sm text-gray-700">מוצר מומלץ</label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>ביטול</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gold hover:bg-gold/90 text-white">
                <Save className="w-4 h-4 ml-2" />
                {saving ? 'שומר...' : 'שמור'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">תמונה</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">שם</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">קטגוריה</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">מחיר</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">מומלץ</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Image className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{getCategoryName(p.category_id)}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">₪{p.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {p.featured ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold">מומלץ</span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">אין מוצרים עדיין</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}