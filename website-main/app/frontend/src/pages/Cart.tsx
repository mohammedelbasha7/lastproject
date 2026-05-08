import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, CreditCard } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { client } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const MAX_LOGO_URL = 'https://mgx-backend-cdn.metadl.com/generate/images/868917/2026-04-20/m7lq6qqaafgq/max-card-logo.png';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('העגלה ריקה');
      return;
    }

    setLoading(true);
    try {
      const cartPayload = items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      }));

      const response = await client.apiCall.invoke({
        url: '/api/v1/payment/create_payment_session',
        method: 'POST',
        data: { items: cartPayload },
      });

      const result = response.data as { url: string; session_id: string };
      if (result?.url) {
        // Use a full-page redirect for the hosted Cardcom payment page.
        window.location.href = result.url;
      } else {
        toast.error('לא ניתן ליצור תשלום כרגע');
      }
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      let message = 'שגיאה ביצירת תשלום';
      let statusCode = 0;
      if (err instanceof Error) {
        message = err.message;
      }
      if (typeof err === 'object' && err !== null) {
        const errObj = err as Record<string, unknown>;
        if (errObj.response && typeof errObj.response === 'object') {
          const resp = errObj.response as Record<string, unknown>;
          if (typeof resp.status === 'number') statusCode = resp.status;
          if (resp.data && typeof resp.data === 'object') {
            const data = resp.data as Record<string, unknown>;
            if (typeof data.detail === 'string') {
              message = data.detail;
            }
          }
        }
      }
      if (statusCode === 503) {
        toast.error('שירות התשלום אינו זמין כרגע. אנא פרסם את האפליקציה ונסה שוב.');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-gold mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span className="text-sm font-medium">חזרה לחנות</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          <ShoppingBag className="inline-block w-8 h-8 ml-2 text-gold" />
          סל הקניות ({totalItems})
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-6">העגלה ריקה</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gold text-white px-8 py-3 rounded-lg font-semibold hover:bg-gold-light transition-colors"
            >
              לקטלוג המוצרים
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  {/* Top row: Image + Info + Delete */}
                  <div className="flex gap-3 items-start">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">{item.product.name}</h3>
                      <p className="text-gold font-bold mt-1 text-sm sm:text-base">₪{item.product.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                      aria-label="הסר מוצר"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Bottom row: Quantity + Subtotal */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-semibold text-lg">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-bold text-gray-900 text-lg">
                      ₪{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-28">
                <h2 className="text-xl font-bold text-gray-900 mb-6">סיכום הזמנה</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>סה״כ מוצרים</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>משלוח</span>
                    <span className="text-green-600 font-medium">חינם</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                    <span>סה״כ לתשלום</span>
                    <span className="text-gold">₪{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-gold text-white py-3 rounded-lg font-semibold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'מעבד...' : 'מעבר לתשלום'}
                </button>

                <button
                  onClick={() => {
                    clearCart();
                    toast.success('העגלה רוקנה');
                  }}
                  className="w-full mt-3 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  ריקון העגלה
                </button>

                {/* Accepted Payment Methods */}
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-3 text-center">אמצעי תשלום מקובלים</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {/* MAX Card */}
                    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
                      <img
                        src={MAX_LOGO_URL}
                        alt="MAX"
                        className="h-5 w-auto object-contain"
                      />
                      <span className="text-xs font-bold text-blue-700">MAX</span>
                    </div>
                    {/* Visa */}
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                      <svg viewBox="0 0 48 32" className="h-5 w-auto" fill="none">
                        <rect width="48" height="32" rx="4" fill="#1A1F71" />
                        <text x="24" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial">VISA</text>
                      </svg>
                    </div>
                    {/* Mastercard */}
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                      <svg viewBox="0 0 48 32" className="h-5 w-auto" fill="none">
                        <rect width="48" height="32" rx="4" fill="#F7F7F7" />
                        <circle cx="19" cy="16" r="9" fill="#EB001B" />
                        <circle cx="29" cy="16" r="9" fill="#F79E1B" />
                        <path d="M24 9.5a9 9 0 0 1 0 13" fill="#FF5F00" />
                        <path d="M24 22.5a9 9 0 0 1 0-13" fill="#FF5F00" />
                      </svg>
                    </div>
                    {/* Generic card icon */}
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-500">עוד</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 text-center">
                    תשלום מאובטח באמצעות Cardcom
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
