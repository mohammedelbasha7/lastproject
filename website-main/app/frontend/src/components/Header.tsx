import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Phone, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { name: 'מיטות זוגיות', slug: 'double-beds' },
  { name: 'מיטות יהודיות', slug: 'jewish-beds' },
  { name: 'מיטות ילדים ונוער', slug: 'kids-beds' },
  { name: 'מזרנים', slug: 'mattresses' },
  { name: 'מערכות ישיבה', slug: 'sofas' },
  { name: 'ארונות', slug: 'wardrobes' },
];

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h6c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.1-2 3.2-4.8 3.2-8.3z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.6l-3.7-2.8c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.3-2-6.2-4.6H2v2.9C3.8 20.6 7.6 23 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.5.4-2.1V7H2c-.8 1.5-1.2 3.2-1.2 5s.4 3.5 1.2 5l3.8-2.9z" />
      <path fill="#EA4335" d="M12 5.3c1.6 0 3.1.6 4.2 1.7l3.2-3.2C17.5 2 15 1 12 1 7.6 1 3.8 3.4 2 7l3.8 2.9C6.7 7.3 9.1 5.3 12 5.3z" />
    </svg>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (slug: string) => {
    setMobileMenuOpen(false);
    navigate(`/category/${slug}`);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = searchQuery.trim();

    if (!searchOpen) {
      setSearchOpen(true);
      return;
    }

    if (!query) return;

    setMobileMenuOpen(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation then scroll
      setTimeout(() => {
        const target = document.querySelector('#contact');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } else {
      const target = document.querySelector('#contact');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCustomerAuthClick = () => {
    setMobileMenuOpen(false);
    if (user) {
      logout();
      return;
    }
    login('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-[#0A0A0A] text-white py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <a href="https://wa.me/9720533049633" target="_blank" rel="noopener noreferrer" className="hover:text-gold-light transition-colors flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>053-304-9633</span>
            </a>
            <a href="mailto:albashadesign@gmail.com" className="hover:text-gold-light transition-colors hidden sm:inline">
              albashadesign@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold-light transition-colors" aria-label="Facebook">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold-light transition-colors" aria-label="Instagram">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-shrink-0 text-right"
          >
            <h1 className="text-3xl font-bold tracking-wider text-gold">ALBASHA</h1>
            <p className="text-xs text-gray-500 tracking-widest">DESIGN</p>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === `/category/${item.slug}`;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleNavClick(item.slug)}
                  className={`text-sm font-medium transition-colors relative group cursor-pointer ${
                    isActive ? 'text-gold' : 'text-gray-700 hover:text-gold'
                  }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1 right-0 h-0.5 bg-gold transition-all ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              className="p-2 text-gray-600 hover:text-gold transition-colors"
              aria-label="חיפוש"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Gmail sign in */}
            <button
              type="button"
              onClick={handleCustomerAuthClick}
              className="hidden sm:inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold hover:border-gold hover:text-gold transition-colors"
            >
              <GoogleIcon />
              <span>{user ? 'Sign out' : 'Sign in with Gmail'}</span>
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="relative p-2 text-gray-600 hover:text-gold transition-colors"
              aria-label="עגלת קניות"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Contact */}
            <a
              href="#contact"
              onClick={handleContactClick}
              className="hidden md:inline-block bg-gold text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors"
            >
              צור קשר
            </a>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gold transition-colors"
              aria-label="תפריט"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="mt-3 pb-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <form className="relative" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חיפוש מוצרים..."
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-gold text-sm"
                dir="rtl"
                autoFocus
              />
              <button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gold transition-colors"
                aria-label="חפש"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navItems.map((item) => {
              const isActive = location.pathname === `/category/${item.slug}`;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleNavClick(item.slug)}
                  className={`text-sm font-medium transition-colors py-2 border-b border-gray-50 cursor-pointer text-right ${
                    isActive ? 'text-gold' : 'text-gray-700 hover:text-gold'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={handleCustomerAuthClick}
              className="sm:hidden inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:border-gold hover:text-gold transition-colors"
            >
              <GoogleIcon />
              <span>{user ? 'Sign out' : 'Sign in with Gmail'}</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
