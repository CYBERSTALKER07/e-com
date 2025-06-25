import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  category: string;
  stock_quantity: number;
  store_id: string;
  created_at: string;
  inStock: boolean;
  specifications?: Record<string, any>;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  color?: string;
  size?: string;
  price: number;
  selected?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateColor: (productId: string, color: string) => void;
  updateSize: (productId: string, size: string) => void;
  toggleItemSelection: (productId: string, selected: boolean) => void;
  selectAllItems: (selected: boolean) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Load cart from AsyncStorage on initial render
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('bagozza_cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart from AsyncStorage:', error);
      }
    };
    
    loadCart();
  }, []);

  // Update totals and save to AsyncStorage whenever cart changes
  useEffect(() => {
    const items = cart.reduce((total, item) => total + item.quantity, 0);
    setTotalItems(items);
    
    const price = cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    setTotalPrice(price);
    
    // Save cart to AsyncStorage
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('bagozza_cart', JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to AsyncStorage:', error);
      }
    };
    
    saveCart();
  }, [cart]);

  const addToCart = (
    product: Product, 
    quantity: number = 1, 
    color?: string, 
    size?: string
  ) => {
    // Check if product is already in cart
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex !== -1) {
      // Update existing item
      const updatedCart = [...cart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: updatedCart[existingItemIndex].quantity + quantity
      };
      
      setCart(updatedCart);
      Alert.alert('Success', 'Item quantity updated in cart');
    } else {
      // Add new item
      const newItem: CartItem = {
        id: Date.now().toString(), // Generate a client-side ID
        product,
        quantity,
        color,
        size,
        price: product.discountPrice || product.price,
        selected: true
      };
      
      setCart(prevCart => [...prevCart, newItem]);
      Alert.alert('Success', 'Item added to cart');
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const updateColor = (productId: string, color: string) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, color } 
          : item
      )
    );
  };

  const updateSize = (productId: string, size: string) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, size } 
          : item
      )
    );
  };

  const toggleItemSelection = (productId: string, selected: boolean) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, selected } 
          : item
      )
    );
  };

  const selectAllItems = (selected: boolean) => {
    setCart(prevCart => 
      prevCart.map(item => ({ ...item, selected }))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const isInCart = (productId: string) => {
    return cart.some(item => item.product.id === productId);
  };

  return (
    <CartContext.Provider value={{
      cart,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateColor,
      updateSize,
      toggleItemSelection,
      selectAllItems,
      clearCart,
      isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};