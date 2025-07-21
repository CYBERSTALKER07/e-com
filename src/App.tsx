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

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">Please refresh the page to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    // Initialize AOS with error handling
    try {
      AOS.init({
        duration: 1000,
        once: true,
        easing: 'ease-out-cubic'
      });
    } catch (error) {
      console.error('Error initializing AOS:', error);
    }

    // Initialize PWA service with error handling
    try {
      console.log('[App] PWA service initialized');
    } catch (error) {
      console.error('Error initializing PWA service:', error);
    }

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

  const handleSplashFinish = React.useCallback(() => {
    try {
      setShowSplash(false);
      setIsAppReady(true);
    } catch (error) {
      console.error('Error in handleSplashFinish:', error);
      // Fallback: hide splash anyway
      setShowSplash(false);
      setIsAppReady(true);
    }
  }, []);

  // Render splash screen with error boundary
  if (showSplash) {
    return (
      <ErrorBoundary>
        <SplashScreen onFinish={handleSplashFinish} duration={3000} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;