import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import SplashScreen from './components/UI/SplashScreen';
import { pwaService } from './services/pwa';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderCompletePage from './pages/PaymentCompletePage'; // Renamed from PaymentCompletePage
import OrdersPage from './pages/Orders/OrdersPage';
import OrderDetailPage from './pages/Orders/OrderDetailPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import StoreAnalyticsDashboard from './pages/Admin/StoreAnalyticsDashboard';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import StorePage from './pages/StorePage';
import UpgradePlanPage from './pages/UpgradePlanPage';
import GalleryPage from './pages/GalleryPage';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    });

    // Initialize PWA service
    console.log('[App] PWA service initialized');

    // Listen for network status changes
    const handleNetworkStatusChange = (event: CustomEvent) => {
      setIsOnline(event.detail.online);
      
      if (event.detail.online) {
        // Show success toast when back online
        const toast = document.createElement('div');
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          z-index: 10000;
          animation: slideIn 0.3s ease;
        `;
        toast.textContent = '🌐 Back online! Data synced.';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      }
    };

    window.addEventListener('networkstatuschange', handleNetworkStatusChange as EventListener);

    // Listen for cart sync events from PWA service
    const handleCartSync = (event: CustomEvent) => {
      console.log('[App] Cart sync event received:', event.detail);
    };

    const handleOrderSync = (event: CustomEvent) => {
      console.log('[App] Order sync event received:', event.detail);
    };

    window.addEventListener('cartsync', handleCartSync as EventListener);
    window.addEventListener('ordersync', handleOrderSync as EventListener);

    return () => {
      window.removeEventListener('networkstatuschange', handleNetworkStatusChange as EventListener);
      window.removeEventListener('cartsync', handleCartSync as EventListener);
      window.removeEventListener('ordersync', handleOrderSync as EventListener);
    };
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    setIsAppReady(true);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} duration={3000} />;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <OrderProvider>
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: isOnline ? '#10b981' : '#ef4444',
                    color: 'white',
                  },
                }}
              />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-complete" element={<OrderCompletePage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/analytics" element={<StoreAnalyticsDashboard />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/stores" element={<StorePage />} />
                <Route path="/upgrade-plan" element={<UpgradePlanPage />} />
              </Routes>
            </OrderProvider>
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;