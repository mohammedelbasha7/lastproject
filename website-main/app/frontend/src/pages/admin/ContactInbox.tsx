import { useState, useEffect } from 'react';
import {
  getContactSubmissions,
  markContactAsRead,
  deleteContactSubmission,
  type ContactSubmission,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Trash2, Mail, MailOpen, Eye, Phone, AtSign, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactInbox() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await getContactSubmissions();
    setSubmissions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkRead = async (id: number) => {
    const result = await markContactAsRead(id);
    if (result) {
      toast.success('סומן כנקרא');
      await loadData();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק הודעה זו?')) return;
    const result = await deleteContactSubmission(id);
    if (result) {
      toast.success('ההודעה נמחקה');
      if (selectedId === id) setSelectedId(null);
      await loadData();
    } else {
      toast.error('שגיאה במחיקת ההודעה');
    }
  };

  const selected = submissions.find((s) => s.id === selectedId);
  const unreadCount = submissions.filter((s) => !s.read).length;

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">תיבת הודעות</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unreadCount} הודעות שלא נקראו</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
            {submissions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedId(s.id!);
                  if (!s.read) handleMarkRead(s.id!);
                }}
                className={`w-full text-right p-4 hover:bg-gray-50 transition-colors ${
                  selectedId === s.id ? 'bg-gold/5 border-r-2 border-gold' : ''
                } ${!s.read ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {!s.read ? (
                    <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  ) : (
                    <MailOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium truncate ${!s.read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {s.name}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate pr-6">{s.message || 'ללא הודעה'}</p>
                {s.created_at && (
                  <p className="text-xs text-gray-300 mt-1 pr-6">
                    {new Date(s.created_at).toLocaleDateString('he-IL')}
                  </p>
                )}
              </button>
            ))}
            {submissions.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>אין הודעות עדיין</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {selected ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(selected.id!)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 ml-1" />
                  מחק
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">טלפון</p>
                    <a href={`tel:${selected.mobile}`} className="text-sm font-medium text-gray-900 hover:text-gold" dir="ltr">
                      {selected.mobile}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <AtSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">אימייל</p>
                    <a href={`mailto:${selected.email}`} className="text-sm font-medium text-gray-900 hover:text-gold" dir="ltr">
                      {selected.email}
                    </a>
                  </div>
                </div>

                {selected.message && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 mb-2">הודעה</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                  </div>
                )}

                {selected.created_at && (
                  <p className="text-xs text-gray-400">
                    נשלח: {new Date(selected.created_at).toLocaleString('he-IL')}
                  </p>
                )}

                <div className="flex gap-3 pt-4">
                  <a
                    href={`https://wa.me/${selected.mobile?.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:${selected.email}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    שלח אימייל
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Eye className="w-12 h-12 mb-3 text-gray-300" />
              <p>בחר הודעה לצפייה</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}