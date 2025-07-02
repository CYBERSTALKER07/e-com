import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
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
  orders: Order[];
  loading: boolean;
  error: string | null;
  createOrder: (
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    items: CartItem[],
    shippingAddress: ShippingAddress,
    billingAddress: BillingAddress | null,
    paymentMethod: string,
    total: number
  ) => Promise<Order | null>;
  getUserOrders: () => Promise<Order[]>;
  getAllOrders: () => Promise<Order[]>;
  getOrderById: (id: string) => Promise<Order | null>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<boolean>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]); // Add missing orders state

  const createOrder = async (
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    items: CartItem[],
    shippingAddress: any,
    billingAddress: any,
    paymentMethod: string,
    total: number
  ): Promise<Order | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate input data
      if (!customerName || !customerEmail || !items.length) {
        throw new Error('Missing required order information');
      }

      if (total <= 0) {
        throw new Error('Order total must be greater than zero');
      }

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      const orderData = {
        customer_id: session?.user?.id || null,
        customer_email: customerEmail,
        customer_name: customerName,
        items: items,
        total: total,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        payment_method: paymentMethod,
        status: 'pending' as OrderStatus,
        created_at: new Date().toISOString(),
        estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        console.error('Supabase order creation error:', error);
        throw new Error(`Failed to create order: ${error.message}`);
      }

      if (!data) {
        throw new Error('No order data returned from database');
      }

      // Transform the data to match our Order interface
      const newOrder: Order = {
        id: data.id,
        customerName: data.customer_name || customerName,
        customerEmail: data.customer_email || customerEmail,
        customerId: data.customer_id,
        items: Array.isArray(data.items) ? data.items : [],
        total: data.total,
        status: data.status as OrderStatus,
        createdAt: data.created_at,
        shippingAddress: data.shipping_address,
        billingAddress: data.billing_address,
        paymentMethod: data.payment_method,
        estimatedDelivery: data.estimated_delivery,
        timeline: [
          {
            status: 'Order placed',
            date: new Date().toLocaleString()
          }
        ]
      };

      // Add to local state
      setOrders(prev => [newOrder, ...prev]);
      
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
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
    if (!id || !status) {
      console.error('Order ID and status are required');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Fix the query syntax - use .eq() instead of filter syntax
      const { data, error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)  // Fixed: use .eq() instead of .filter()
        .select()
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      // Update local state only if orders exist
      setOrders(prev => prev.map(order => {
        if (order.id === id) {
          const newEvent = {
            status: 
              status === 'processing' ? 'Order confirmed' :
              status === 'shipped' ? 'Order shipped' :
              status === 'delivered' ? 'Order delivered' :
              status === 'cancelled' ? 'Order cancelled' : 
              'Status updated',
            date: new Date().toLocaleString()
          };
          
          const timeline = order.timeline ? [...order.timeline] : [];
          if (!timeline.some(event => event.status === newEvent.status)) {
            timeline.push(newEvent);
          }
          
          return {
            ...order,
            status,
            timeline
          };
        }
        return order;
      }));
      
      toast.success(`Order status updated to ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
      toast.error('Failed to update order status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async (): Promise<void> => {
    if (!user) {
      setOrders([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match our Order interface
      const transformedOrders: Order[] = (data || []).map(order => ({
        ...order,
        // Ensure all required fields are present
        shipping_address: order.shipping_address || {},
        billing_address: order.billing_address || {},
        items: Array.isArray(order.items) ? order.items : []
      }));
      
      setOrders(transformedOrders);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Load orders when user changes
  React.useEffect(() => {
    if (user) {
      refreshOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        createOrder,
        getUserOrders,
        getAllOrders,
        getOrderById,
        updateOrderStatus,
        refreshOrders
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