import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, Clock, Settings, User, Grid, ShoppingCart, BarChart3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { stores } = useStore();

  // Check if user is a store owner (has at least one store)
  const isStoreOwner = stores && stores.length > 0;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed top-0 left-0 h-full w-[70px] bg-white shadow-lg z-50">
      <div className="flex flex-col h-full py-4">
        <Link 
          to="/" 
          className={`flex items-center justify-center h-[70px] ${
            isActive('/') ? 'text-primary' : 'text-gray-700 hover:text-primary'
          }`}
          title="Главная"
        >
          <Home className="h-6 w-6" />
        </Link>

        <Link 
          to="/products" 
          className={`flex items-center justify-center h-[70px] ${
            isActive('/products') ? 'text-primary' : 'text-gray-700 hover:text-primary'
          }`}
          title="Магазин"
        >
          <ShoppingBag className="h-6 w-6" />
        </Link>

        <Link 
          to="/gallery" 
          className={`flex items-center justify-center h-[70px] ${
            isActive('/gallery') ? 'text-primary' : 'text-gray-700 hover:text-primary'
          }`}
          title="Галерея"
        >
          <Grid className="h-6 w-6" />
        </Link>

        <Link 
          to="/cart" 
          className={`flex items-center justify-center h-[70px] relative ${
            isActive('/cart') ? 'text-primary' : 'text-gray-700 hover:text-primary'
          }`}
          title="Корзина"
        >
          <Heart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute top-3.5 right-3.5 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>

        {isAuthenticated && (
          <Link 
            to="/orders" 
            className={`flex items-center justify-center h-[70px] ${
              isActive('/orders') ? 'text-primary' : 'text-gray-700 hover:text-primary'
            }`}
            title="Заказы"
          >
            <Clock className="h-6 w-6" />
          </Link>
        )}

        {/* Analytics link for admins and store owners */}
        {(isAdmin || isStoreOwner) && (
          <Link 
            to="/admin/analytics" 
            className={`flex items-center justify-center h-[70px] ${
              isActive('/admin/analytics') ? 'text-primary' : 'text-gray-700 hover:text-primary'
            }`}
            title="Аналитика"
          >
            <BarChart3 className="h-6 w-6" />
          </Link>
        )}

        {isAdmin && (
          <Link 
            to="/admin" 
            className={`flex items-center justify-center h-[70px] ${
              isActive('/admin') ? 'text-primary' : 'text-gray-700 hover:text-primary'
            }`}
            title="Админ панель"
          >
            <Settings className="h-6 w-6" />
          </Link>
        )}

        {!isAuthenticated && (
          <Link 
            to="/login" 
            className={`flex items-center justify-center h-[70px] ${
              isActive('/login') ? 'text-primary' : 'text-gray-700 hover:text-primary'
            }`}
            title="Войти"
          >
            <User className="h-6 w-6" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;