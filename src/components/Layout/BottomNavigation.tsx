import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, Clock, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-auto max-w-md bg-[#6B4423] rounded-tl-[50px] rounded-tr-[50px] shadow-lg">
        <div className="flex items-center justify-around h-16">
          <Link 
            to="/" 
            className={`flex flex-col items-center justify-center w-full h-full ${isActive('/') ? 'text-primary' : 'text-white'}`}
          >
            <div className={`p-2 rounded-full ${isActive('/') ? 'bg-white' : 'bg-transparent'}`}>
              <Home className={`h-5 w-5 ${isActive('/') ? 'text-primary' : 'text-white'}`} />
            </div>
            <span className="text-xs mt-1">Главная</span>
          </Link>
          
          <Link 
            to="/products" 
            className={`flex flex-col items-center justify-center w-full h-full ${isActive('/products') ? 'text-primary' : 'text-white'}`}
          >
            <div className={`p-2 rounded-full ${isActive('/products') ? 'bg-white' : 'bg-transparent'}`}>
              <ShoppingBag className={`h-5 w-5 ${isActive('/products') ? 'text-primary' : 'text-white'}`} />
            </div>
            <span className="text-xs mt-1">Магазин</span>
          </Link>
          
          <Link 
            to="/cart" 
            className={`flex flex-col items-center justify-center w-full h-full ${isActive('/cart') ? 'text-primary' : 'text-white'}`}
          >
            <div className={`p-2 rounded-full ${isActive('/cart') ? 'bg-white' : 'bg-transparent'}`}>
              <div className="relative">
                <Heart className={`h-5 w-5 ${isActive('/cart') ? 'text-primary' : 'text-white'}`} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs mt-1">Избранное</span>
          </Link>
          
          {isAuthenticated ? (
            <Link 
              to="/orders" 
              className={`flex flex-col items-center justify-center w-full h-full ${isActive('/orders') ? 'text-primary' : 'text-white'}`}
            >
              <div className={`p-2 rounded-full ${isActive('/orders') ? 'bg-white' : 'bg-transparent'}`}>
                <Clock className={`h-5 w-5 ${isActive('/orders') ? 'text-primary' : 'text-white'}`} />
              </div>
              <span className="text-xs mt-1">Заказы</span>
            </Link>
          ) : (
            <Link 
              to="/login" 
              className={`flex flex-col items-center justify-center w-full h-full ${isActive('/login') ? 'text-primary' : 'text-white'}`}
            >
              <div className={`p-2 rounded-full ${isActive('/login') ? 'bg-white' : 'bg-transparent'}`}>
                <User className={`h-5 w-5 ${isActive('/login') ? 'text-primary' : 'text-white'}`} />
              </div>
              <span className="text-xs mt-1">Войти</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
