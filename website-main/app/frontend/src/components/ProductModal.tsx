import { X, Phone, MessageCircle, ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';
import { type Product } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem } = useCart();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const whatsappMsg = encodeURIComponent(`שלום, אני מעוניין במוצר: ${product.name} (₪${product.price.toLocaleString()})`);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-colors"
            aria-label="סגור"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
          <div className="aspect-video md:aspect-[16/9] overflow-hidden rounded-t-2xl">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="p-6 md:p-8 text-right">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h2>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xs text-gray-400">החל מ -</span>
            <span className="text-3xl font-bold text-gold">₪{product.price.toLocaleString()}</span>
          </div>
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
          <div className="border-t pt-6 space-y-3">
            <h3 className="font-bold text-gray-900 mb-3">מעוניינים במוצר?</h3>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  addItem(product);
                  toast.success(`${product.name} נוסף לעגלה`);
                  onClose();
                }}
                className="flex items-center gap-2 bg-[#0A0A0A] text-white px-5 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>הוסף לעגלה</span>
              </button>
              <a
                href={`https://wa.me/9720533049633?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-4 h-4" />
                <span>פנייה בוואטסאפ</span>
              </a>
              <a
                href="tel:0533049633"
                className="flex items-center gap-2 bg-gold text-white px-5 py-3 rounded-lg font-semibold hover:bg-gold-light transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>חייגו: 053-304-9633</span>
              </a>
              <a
                href="#contact"
                onClick={onClose}
                className="flex items-center gap-2 border-2 border-gold text-gold px-5 py-3 rounded-lg font-semibold hover:bg-gold hover:text-white transition-colors"
              >
                שליחת פנייה
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}