import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Category, getCategories } from '@/lib/api';

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const data = await getCategories();
      setCategories(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <section id="categories" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">הקטגוריות שלנו</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">הקטגוריות שלנו</h2>
          <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => navigate(`/category/${category.slug}`)}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer text-right"
            >
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 right-0 left-0 p-4">
                <h3 className="text-white font-bold text-lg md:text-xl">{category.name}</h3>
                <div className="w-8 h-0.5 bg-gold mt-2 transition-all duration-300 group-hover:w-16" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}