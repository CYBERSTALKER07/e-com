import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, Clock, User, Package, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const { totalItems } = useCart();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-white h-full shadow-lg fixed left-0 top-16 bottom-0 pt-6">
      <div className="flex flex-col space-y-2 px-4">
        <Link 
          to="/" 
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
            isActive('/') ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Главная</span>
        </Link>

        <Link 
          to="/products" 
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
            isActive('/products') ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ShoppingBag className="h-5 w-5" />
          <span>Магазин</span>
        </Link>

        <Link 
          to="/cart" 
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
            isActive('/cart') ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="relative">
            <Heart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span>Избранное</span>
        </Link>

        {isAuthenticated && (
          <>
            <Link 
              to="/orders" 
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                isActive('/orders') ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Clock className="h-5 w-5" />
              <span>Заказы</span>
            </Link>

            <Link 
              to="/stores" 
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                isActive('/stores') ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package className="h-5 w-5" />
              <span>Мой магазин</span>
            </Link>
          </>
        )}

        {isAdmin && (
          <Link 
            to="/admin" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
              isActive('/admin') ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Админ панель</span>
          </Link>
        )}

        {!isAuthenticated && (
          <Link 
            to="/login" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
              isActive('/login') ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Войти</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;