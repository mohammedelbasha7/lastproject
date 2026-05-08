import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Index from './pages/Index';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import CartPage from './pages/Cart';
import PaymentSuccessPage from './pages/PaymentSuccess';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';

const queryClient = new QueryClient();
const routerBasename = import.meta.env.BASE_URL;

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/category/:slug" element={<CategoryPage />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/payment-success" element={<PaymentSuccessPage />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/auth/error" element={<AuthError />} />
    <Route
      path="/admin/*"
      element={
        <ProtectedAdminRoute>
          <AdminDashboard />
        </ProtectedAdminRoute>
      }
    />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter basename={routerBasename}>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
export { AppRoutes };
