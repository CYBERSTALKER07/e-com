import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, Clock, Grid, BarChart3 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../context/StoreContext';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const { stores } = useStore();
  
  // Check if user is a store owner (has at least one store)
  const isStoreOwner = stores && stores.length > 0;
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-tl-[50px] rounded-tr-[50px] border-gray-200 md:hidden z-50">
      <div className="flex items-center justify-around h-16">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-full h-full ${isActive('/') ? 'text-primary' : 'text-gray-500'}`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link 
          to="/products" 
          className={`flex flex-col items-center justify-center w-full h-full ${isActive('/products') ? 'text-primary' : 'text-gray-500'}`}
        >
          <ShoppingBag className="h-6 w-6" />
          <span className="text-xs mt-1">Shop</span>
        </Link>
        
        <Link 
          to="/gallery" 
          className={`flex flex-col items-center justify-center w-full h-full ${isActive('/gallery') ? 'text-primary' : 'text-gray-500'}`}
        >
          <Grid className="h-6 w-6" />
          <span className="text-xs mt-1">Gallery</span>
        </Link>
        
        <Link 
          to="/cart" 
          className={`flex flex-col items-center justify-center w-full h-full ${isActive('/cart') ? 'text-primary' : 'text-gray-500'}`}
        >
          <div className="relative">
            <Heart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-xs mt-1">Favorites</span>
        </Link>
        
        {/* Show analytics for admins and store owners */}
        {(isAdmin || isStoreOwner) ? (
          <Link 
            to="/admin/analytics" 
            className={`flex flex-col items-center justify-center w-full h-full ${isActive('/admin/analytics') ? 'text-primary' : 'text-gray-500'}`}
          >
            <BarChart3 className="h-6 w-6" />
            <span className="text-xs mt-1">Analytics</span>
          </Link>
        ) : (
          <Link 
            to="/orders" 
            className={`flex flex-col items-center justify-center w-full h-full ${isActive('/orders') ? 'text-primary' : 'text-gray-500'}`}
          >
            <Clock className="h-6 w-6" />
            <span className="text-xs mt-1">Orders</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default BottomNavigation;