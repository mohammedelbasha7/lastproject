import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { type Product, getProducts, getFeaturedProducts } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import ProductModal from './ProductModal';

interface ProductSectionProps {
  title: string;
  filterCategoryId?: number;
  categorySlug?: string;
}

export default function ProductSection({ title, filterCategoryId, categorySlug }: ProductSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      if (filterCategoryId) {
        // Fetch products for a specific category
        const data = await getProducts(filterCategoryId);
        setProducts(data);
      } else {
        // Fetch featured products for the general section
        const data = await getFeaturedProducts();
        setProducts(data);
      }
      setLoading(false);
    }
    load();
  }, [filterCategoryId]);

  // For homepage: show up to 3 products (excluding mattresses if no filter)
  const displayProducts = filterCategoryId
    ? products.slice(0, 6)
    : products.filter((p) => p.category_id !== 4).slice(0, 3);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
      </section>
    );
  }

  if (displayProducts.length === 0) return null;

  return (
    <>
      <section id={filterCategoryId ? 'mattresses' : 'featured'} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h2>
            <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {displayProducts.map((product) => (
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

          {/* "View All" button linking to category page */}
          {categorySlug && (
            <div className="text-center mt-8">
              <button
                type="button"
                onClick={() => navigate(`/category/${categorySlug}`)}
                className="inline-flex items-center gap-2 bg-white border-2 border-gold text-gold px-6 py-3 rounded-lg font-semibold hover:bg-gold hover:text-white transition-colors"
              >
                <span>לכל המוצרים בקטגוריה</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </>
  );
}