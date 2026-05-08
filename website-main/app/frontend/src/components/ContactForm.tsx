import { useState } from 'react';
import { submitContact } from '@/lib/api';
import { Send, CheckCircle } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await submitContact(formData);
    setSubmitting(false);
    if (success) {
      setSubmitted(true);
      setFormData({ name: '', mobile: '', email: '', message: '' });
    }
  };

  if (submitted) {
    return (
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">הפנייה נשלחה בהצלחה!</h3>
            <p className="text-gray-500 mb-6">נחזור אליכם בהקדם האפשרי</p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-gold hover:text-gold-dark font-medium underline"
            >
              שליחת פנייה נוספת
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">צריכים עזרה?</h2>
            <p className="text-gray-500">אנחנו זמינים עבורכם לכל שאלה</p>
            <div className="w-16 h-1 bg-gold mx-auto rounded-full mt-4" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">שם *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 text-sm transition-colors"
                  placeholder="השם שלכם"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">נייד *</label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 text-sm transition-colors"
                  placeholder="מספר הנייד"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">מייל *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 text-sm transition-colors"
                placeholder="כתובת המייל"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">הודעה</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 text-sm transition-colors resize-none"
                placeholder="איך נוכל לעזור?"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold text-white py-3.5 rounded-lg font-semibold text-sm hover:bg-gold-light transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <span>שולח...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>שליחה</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}