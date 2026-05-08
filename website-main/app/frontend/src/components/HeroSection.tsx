const HERO_IMAGE = 'https://mgx-backend-cdn.metadl.com/generate/images/868917/2026-04-18/m3youbqaafaa/hero-luxury-bedroom.png';

export default function HeroSection() {
  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, selector: string) => {
    e.preventDefault();
    const target = document.querySelector(selector);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="top" className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="אלבשה דיזיין - בית של עיצובים"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1600&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/50 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-xl text-right">
          <h2 className="text-lg md:text-xl text-gold-light font-medium mb-3 tracking-wider">
            ALBASHA DESIGN
          </h2>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            בית של עיצובים
          </h1>
          <p className="text-base md:text-lg text-gray-200 leading-relaxed mb-8 max-w-md">
            אלבשה דיזיין מתמחה בייבוא מיטות ומזרנים מאירופה. אנו מציעים מוצרים באיכות גבוהה במחירים אטרקטיביים, עם שירות מקצועי ואספקה מהירה עד הבית.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#featured"
              onClick={(e) => scrollTo(e, '#featured')}
              className="inline-block bg-gold text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-gold-light transition-colors duration-300 cursor-pointer"
            >
              לקטלוג המוצרים
            </a>
            <a
              href="#contact"
              onClick={(e) => scrollTo(e, '#contact')}
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-white hover:text-gray-900 transition-colors duration-300 cursor-pointer"
            >
              צור קשר
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}