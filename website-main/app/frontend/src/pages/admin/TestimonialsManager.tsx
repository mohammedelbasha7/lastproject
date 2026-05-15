import { useState, useEffect } from 'react';
import {
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type Testimonial,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, X, Save, Star } from 'lucide-react';
import { toast } from 'sonner';

interface TestimonialForm {
  customer_name: string;
  content: string;
  rating: string;
}

const emptyForm: TestimonialForm = { customer_name: '', content: '', rating: '5' };

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TestimonialForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getAdminTestimonials();
    setTestimonials(data);
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

  const openEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setForm({
      customer_name: t.customer_name,
      content: t.content,
      rating: String(t.rating),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.customer_name || !form.content) {
      toast.error('נא למלא את כל השדות');
      return;
    }
    setSaving(true);
    const data = {
      customer_name: form.customer_name,
      content: form.content,
      rating: parseInt(form.rating, 10),
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    if (editingId) {
      const result = await updateTestimonial(editingId, data);
      if (result) toast.success('חוות הדעת עודכנה בהצלחה');
      else toast.error('שגיאה בעדכון');
    } else {
      const result = await createTestimonial(data);
      if (result) toast.success('חוות הדעת נוצרה בהצלחה');
      else toast.error('שגיאה ביצירה');
    }
    setSaving(false);
    setShowForm(false);
    await loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק חוות דעת זו?')) return;
    const result = await deleteTestimonial(id);
    if (result) {
      toast.success('חוות הדעת נמחקה');
      await loadData();
    } else {
      toast.error('שגיאה במחיקה');
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
        <h1 className="text-2xl font-bold text-gray-900">ניהול חוות דעת</h1>
        <Button onClick={openCreate} className="bg-gold hover:bg-gold/90 text-white">
          <Plus className="w-4 h-4 ml-2" />
          הוסף חוות דעת
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{editingId ? 'עריכת חוות דעת' : 'חוות דעת חדשה'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם הלקוח *</label>
                <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="שם הלקוח" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תוכן *</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="חוות הדעת של הלקוח"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gold min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">דירוג</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, rating: String(r) })}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          r <= parseInt(form.rating) ? 'fill-gold text-gold' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
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

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 group relative">
            <div className="absolute top-3 left-3 flex gap-1">
              <button type="button" onClick={() => openEdit(t)} className="p-1.5 bg-gray-50 rounded-lg text-blue-600 hover:bg-blue-50" aria-label="Edit testimonial">
                <Pencil className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => handleDelete(t.id)} className="p-1.5 bg-gray-50 rounded-lg text-red-500 hover:bg-red-50" aria-label="Delete testimonial">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-0.5 mb-3">
              {[...Array(t.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gold text-gold" />
              ))}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">&ldquo;{t.content}&rdquo;</p>
            <p className="text-sm font-bold text-gray-900">{t.customer_name}</p>
          </div>
        ))}
        {testimonials.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">אין חוות דעת עדיין</div>
        )}
      </div>
    </div>
  );
}
