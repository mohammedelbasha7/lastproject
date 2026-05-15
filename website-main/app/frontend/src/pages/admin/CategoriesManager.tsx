import { useState, useEffect } from 'react';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUploadButton from '@/components/admin/ImageUploadButton';
import { Plus, Pencil, Trash2, X, Save, Image } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryForm {
  name: string;
  slug: string;
  image_url: string;
  display_order: string;
}

const emptyForm: CategoryForm = { name: '', slug: '', image_url: '', display_order: '' };

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const cats = await getAdminCategories();
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, display_order: String(categories.length + 1) });
    setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      slug: c.slug,
      image_url: c.image_url || '',
      display_order: String(c.display_order || 0),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error('נא למלא את שם הקטגוריה');
      return;
    }
    setSaving(true);
    const data = {
      name: form.name,
      slug: form.slug || form.name.replace(/\s+/g, '-').toLowerCase(),
      image_url: form.image_url,
      display_order: parseInt(form.display_order, 10) || 0,
    };

    if (editingId) {
      const result = await updateCategory(editingId, data);
      if (result) toast.success('הקטגוריה עודכנה בהצלחה');
      else toast.error('שגיאה בעדכון הקטגוריה');
    } else {
      const result = await createCategory(data);
      if (result) toast.success('הקטגוריה נוצרה בהצלחה');
      else toast.error('שגיאה ביצירת הקטגוריה');
    }
    setSaving(false);
    setShowForm(false);
    await loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק קטגוריה זו?')) return;
    const result = await deleteCategory(id);
    if (result) {
      toast.success('הקטגוריה נמחקה בהצלחה');
      await loadData();
    } else {
      toast.error('שגיאה במחיקת הקטגוריה');
    }
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
        <h1 className="text-2xl font-bold text-gray-900">ניהול קטגוריות</h1>
        <Button onClick={openCreate} className="bg-gold hover:bg-gold/90 text-white">
          <Plus className="w-4 h-4 ml-2" />
          הוסף קטגוריה
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{editingId ? 'עריכת קטגוריה' : 'קטגוריה חדשה'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם הקטגוריה *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="שם הקטגוריה" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="category-slug" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">קישור לתמונה</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                    dir="ltr"
                  />
                  <ImageUploadButton onUploaded={(url) => setForm({ ...form, image_url: url })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סדר תצוגה</label>
                <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} placeholder="1" dir="ltr" />
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

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="h-40 bg-gray-100 relative">
              {c.image_url ? (
                <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-10 h-10 text-gray-300" />
                </div>
              )}
              <div className="absolute top-2 left-2 flex gap-1">
                <button type="button" onClick={() => openEdit(c)} className="p-1.5 bg-white rounded-lg shadow-sm text-blue-600 hover:bg-blue-50" aria-label="Edit category">
                  <Pencil className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => handleDelete(c.id)} className="p-1.5 bg-white rounded-lg shadow-sm text-red-500 hover:bg-red-50" aria-label="Delete category">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900">{c.name}</h3>
              <p className="text-xs text-gray-400 mt-1">סדר: {c.display_order}</p>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">אין קטגוריות עדיין</div>
        )}
      </div>
    </div>
  );
}
