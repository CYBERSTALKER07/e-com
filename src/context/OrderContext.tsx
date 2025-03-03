import React, { createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { CartItem, ShippingAddress, BillingAddress, OrderStatus } from '../types';

interface Order {
  id: string;
  created_at: string;
  customer_id: string;
  status: OrderStatus;
  total: number;
  shipping_address: ShippingAddress;
  billing_address: BillingAddress;
  payment_method: string;
  items: CartItem[];
  estimated_delivery: string;
}

interface OrderContextType {
  createOrder: (
    customerName: string,
    customerEmail: string,
    items: CartItem[],
    shippingAddress: ShippingAddress,
    billingAddress: BillingAddress,
    paymentMethod: string,
    total: number
  ) => Promise<Order | null>;
  getUserOrders: () => Promise<Order[]>;
  getAllOrders: () => Promise<Order[]>;
  getOrderById: (id: string) => Promise<Order | null>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<boolean>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();

  const createOrder = async (
    customerName: string,
    customerEmail: string,
    items: CartItem[],
    shippingAddress: ShippingAddress,
    billingAddress: BillingAddress,
    paymentMethod: string,
    total: number
  ): Promise<Order | null> => {
    try {
      if (!user) {
        toast.error('You must be logged in to create an order');
        return null;
      }

      const newOrder = {
        customer_id: user.id,
        status: 'pending' as OrderStatus,
        total,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        payment_method: paymentMethod,
        items
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(newOrder)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Order created successfully!');
      return data as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
      return null;
    }
  };

  const getUserOrders = async (): Promise<Order[]> => {
    try {
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Order[];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      toast.error('Failed to fetch orders');
      return [];
    }
  };

  const getAllOrders = async (): Promise<Order[]> => {
    try {
      if (!isAdmin) {
        toast.error('Unauthorized access');
        return [];
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Order[];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      toast.error('Failed to fetch orders');
      return [];
    }
  };

  const getOrderById = async (id: string): Promise<Order | null> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      // Check if the user is authorized to view this order
      if (!isAdmin && data.customer_id !== user?.id) {
        toast.error('Unauthorized access');
        return null;
      }

      return data as Order;
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order details');
      return null;
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus): Promise<boolean> => {
    try {
      if (!isAdmin) {
        toast.error('Unauthorized access');
        return false;
      }

      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success(`Order status updated to ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
      return false;
    }
  };

  return (
    <OrderContext.Provider
      value={{
        createOrder,
        getUserOrders,
        getAllOrders,
        getOrderById,
        updateOrderStatus
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};