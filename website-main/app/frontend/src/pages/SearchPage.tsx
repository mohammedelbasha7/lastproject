import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, ShoppingCart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductModal from '@/components/ProductModal';
import { type Category, type Product, getCategories, getProducts } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const normalize = (value: string) => value.trim().toLocaleLowerCase();

const getSearchForms = (value: string) => {
  const normalized = normalize(value);
  return [normalized, normalized.replace(/ות/g, 'ה')].filter(Boolean);
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const query = searchParams.get('q')?.trim() || '';
  const normalizedQuery = normalize(query);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [productData, categoryData] = await Promise.all([getProducts(), getCategories()]);
      setProducts(productData);
      setCategories(categoryData);
      setLoading(false);
    }

    load();
  }, []);

  const results = useMemo(() => {
    if (!normalizedQuery) return [];

    return products.filter((product) => {
      const category = categories.find((item) => item.id === product.category_id);
      const searchableText = [
        product.name,
        product.description,
        product.slug,
        category?.name,
        category?.slug,
        product.price.toString(),
      ]
        .filter(Boolean)
        .join(' ');

      const queryForms = getSearchForms(normalizedQuery);
      const productForms = getSearchForms(searchableText);

      return queryForms.some((queryForm) =>
        productForms.some((productForm) => productForm.includes(queryForm)),
      );
    });
  }, [categories, normalizedQuery, products]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-gold mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span className="text-sm font-medium">חזרה לדף הבית</span>
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-11 h-11 rounded-full bg-gold/10 text-gold flex items-center justify-center">
              <Search className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">תוצאות חיפוש</h1>
              <p className="text-sm text-gray-500 mt-1">
                {query ? `חיפוש עבור: ${query}` : 'הקלידו מילה בשורת החיפוש למעלה'}
              </p>
            </div>
          </div>
          <div className="w-16 h-1 bg-gold rounded-full" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : !query ? (
          <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-lg">פתחו את שורת החיפוש והקלידו שם מוצר, קטגוריה או מחיר.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-lg mb-5">לא נמצאו מוצרים שמתאימים לחיפוש.</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-gold text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gold-light transition-colors"
            >
              חזרה לחנות
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">{results.length} מוצרים נמצאו</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {results.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1 cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5 text-right">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                          }}
                          className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors duration-300"
                        >
                          פרטים
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem(product);
                            toast.success(`${product.name} נוסף לעגלה`);
                          }}
                          className="bg-[#0A0A0A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors duration-300 flex items-center gap-1.5"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>הוסף</span>
                        </button>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <span className="text-xs text-gray-400 block">החל מ -</span>
                        <span className="text-xl font-bold text-gold">₪{product.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
