import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { client } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type VerifyState = 'loading' | 'success' | 'failed';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [state, setState] = useState<VerifyState>('loading');
  const sessionId = searchParams.get('session_id') || searchParams.get('order_id');

  useEffect(() => {
    if (!sessionId) {
      setState('failed');
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const response = await client.apiCall.invoke({
          url: '/api/v1/payment/verify_payment',
          method: 'POST',
          data: { session_id: sessionId },
        });

        if (cancelled) return;

        const result = response.data as { status: string; payment_status: string };
        if (result.status === 'paid' || result.payment_status === 'paid') {
          setState('success');
          clearCart();
        } else {
          setState('failed');
        }
      } catch {
        if (!cancelled) setState('failed');
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        {state === 'loading' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto text-gold animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">מאמת את התשלום...</h2>
            <p className="text-gray-500">אנא המתינו</p>
          </div>
        )}

        {state === 'success' && (
          <div className="text-center max-w-md">
            <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-3">התשלום בוצע בהצלחה!</h2>
            <p className="text-gray-500 mb-8">
              תודה על הרכישה! ההזמנה שלך התקבלה ונטפל בה בהקדם.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gold text-white px-8 py-3 rounded-lg font-semibold hover:bg-gold-light transition-colors"
            >
              חזרה לדף הבית
            </button>
          </div>
        )}

        {state === 'failed' && (
          <div className="text-center max-w-md">
            <XCircle className="w-20 h-20 mx-auto text-red-400 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-3">שגיאה באימות התשלום</h2>
            <p className="text-gray-500 mb-8">
              לא הצלחנו לאמת את התשלום. אנא צרו קשר עם שירות הלקוחות.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/cart')}
                className="bg-gold text-white px-6 py-3 rounded-lg font-semibold hover:bg-gold-light transition-colors"
              >
                חזרה לעגלה
              </button>
              <button
                onClick={() => navigate('/')}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                דף הבית
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
