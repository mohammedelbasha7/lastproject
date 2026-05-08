import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminStats } from '@/lib/api';
import {
  LayoutDashboard,
  Package,
  Boxes,
  FolderOpen,
  MessageSquare,
  Star,
  LogOut,
  Home,
  Menu,
  X,
  ShoppingBag,
  Users,
  Mail,
  MailOpen,
} from 'lucide-react';
import ProductsManager from './admin/ProductsManager';
import InventoryEditor from './admin/InventoryEditor';
import CategoriesManager from './admin/CategoriesManager';
import ContactInbox from './admin/ContactInbox';
import TestimonialsManager from './admin/TestimonialsManager';

interface Stats {
  totalProducts: number;
  totalCategories: number;
  totalTestimonials: number;
  totalContacts: number;
  unreadContacts: number;
}

function DashboardHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAdminStats();
      setStats(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold" />
      </div>
    );
  }

  const cards = [
    { label: 'מוצרים', value: stats?.totalProducts ?? 0, icon: <ShoppingBag className="w-8 h-8" />, color: 'bg-blue-50 text-blue-600' },
    { label: 'קטגוריות', value: stats?.totalCategories ?? 0, icon: <FolderOpen className="w-8 h-8" />, color: 'bg-green-50 text-green-600' },
    { label: 'חוות דעת', value: stats?.totalTestimonials ?? 0, icon: <Star className="w-8 h-8" />, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'הודעות', value: stats?.totalContacts ?? 0, icon: <Mail className="w-8 h-8" />, color: 'bg-purple-50 text-purple-600' },
    { label: 'הודעות שלא נקראו', value: stats?.unreadContacts ?? 0, icon: <MailOpen className="w-8 h-8" />, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">לוח בקרה</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className={`w-14 h-14 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const navItems = [
  { to: '/admin', label: 'לוח בקרה', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
  { to: '/admin/products', label: 'מוצרים', icon: <Package className="w-5 h-5" />, end: false },
  { to: '/admin/inventory', label: 'Inventory', icon: <Boxes className="w-5 h-5" />, end: false },
  { to: '/admin/categories', label: 'קטגוריות', icon: <FolderOpen className="w-5 h-5" />, end: false },
  { to: '/admin/inbox', label: 'הודעות', icon: <MessageSquare className="w-5 h-5" />, end: false },
  { to: '/admin/testimonials', label: 'חוות דעת', icon: <Star className="w-5 h-5" />, end: false },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-50 w-64 bg-[#0A0A0A] text-white transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gold">ALBASHA</h2>
              <p className="text-xs text-gray-400 tracking-widest">ADMIN PANEL</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-gold text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User & Actions */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-3 px-4 py-2">
              <Users className="w-5 h-5 text-gray-400" />
              <div className="text-sm">
                <p className="text-gray-300 truncate">{user?.email}</p>
                <p className="text-xs text-gold">מנהל</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
              חזרה לאתר
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              התנתקות
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-600 hover:text-gold transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-700">ניהול האתר</h2>
          <div className="w-10" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<ProductsManager />} />
            <Route path="inventory" element={<InventoryEditor />} />
            <Route path="categories" element={<CategoriesManager />} />
            <Route path="inbox" element={<ContactInbox />} />
            <Route path="testimonials" element={<TestimonialsManager />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
