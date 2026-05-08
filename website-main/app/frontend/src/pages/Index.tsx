import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryGrid from '@/components/CategoryGrid';
import ProductSection from '@/components/ProductSection';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { type Testimonial, getTestimonials } from '@/lib/api';
import { Star, Truck, Shield, HeartHandshake, ChevronRight, ChevronLeft } from 'lucide-react';

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function load() {
      const data = await getTestimonials();
      setTestimonials(data);
    }
    load();
  }, []);

  if (testimonials.length === 0) return null;

  const next = () => setCurrentIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">מה הלקוחות שלנו אומרים</h2>
          <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
        </div>

        <div className="max-w-2xl mx-auto relative">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-gold text-gold" />
              ))}
            </div>
            <p className="text-gray-600 text-lg leading-relaxed mb-6 min-h-[80px]">
              &ldquo;{testimonials[currentIndex].content}&rdquo;
            </p>
            <p className="font-bold text-gray-900">{testimonials[currentIndex].customer_name}</p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gold hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === currentIndex ? 'bg-gold' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gold hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyBuySection() {
  const values = [
    {
      icon: <HeartHandshake className="w-10 h-10" />,
      title: 'חוויית שירות',
      description: 'שירות הכי גבוה בענף מרגע הרכישה ועד האספקה לבית הלקוח',
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: 'איכות',
      description: 'מיטות מיוצרות באירופה ועומדות בתקנים האירופאים המחמירים',
    },
    {
      icon: <Truck className="w-10 h-10" />,
      title: 'אספקה מהירה',
      description: 'אספקה מהירה עד הבית כדי לעלות על הציפיות של הלקוחות שלנו',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">למה לקנות אצלנו</h2>
          <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {values.map((item) => (
            <div
              key={item.title}
              className="text-center group"
            >
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-300">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      <main>
        <HeroSection />
        <CategoryGrid />
        <ProductSection title="הכי מומלצים" />
        <ProductSection title="המזרנים שלנו" filterCategoryId={4} categorySlug="mattresses" />
        <TestimonialsSection />
        <WhyBuySection />
        <ContactForm />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}