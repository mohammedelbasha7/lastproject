import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductModal from '@/components/ProductModal';
import { type Product, type Category, getProducts, getCategories } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const cats = await getCategories();
      setAllCategories(cats);
      const matched = cats.find((c) => c.slug === slug);
      setCategory(matched || null);

      if (matched) {
        const prods = await getProducts(matched.id);
        setProducts(prods);
      } else {
        setProducts([]);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-gold mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span className="text-sm font-medium">חזרה לדף הבית</span>
        </button>

        {loading ? (
          <div>
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="aspect-square bg-gray-100 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !category ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-6">הקטגוריה לא נמצאה</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gold text-white px-8 py-3 rounded-lg font-semibold hover:bg-gold-light transition-colors"
            >
              חזרה לדף הבית
            </button>
          </div>
        ) : (
          <>
            {/* Category Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{category.name}</h1>
              <div className="w-16 h-1 bg-gold rounded-full" />
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {allCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/category/${cat.slug}`)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    cat.slug === slug
                      ? 'bg-gold text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gold hover:text-gold'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg mb-4">אין מוצרים בקטגוריה זו כרגע</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gold text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gold-light transition-colors"
                >
                  חזרה לדף הבית
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
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
                      <div className="flex items-center justify-between">
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
                        <div className="text-left">
                          <span className="text-xs text-gray-400 block">החל מ -</span>
                          <span className="text-xl font-bold text-gold">₪{product.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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