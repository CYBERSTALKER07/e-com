import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './AuthContext';
import { AuthContext } from './AuthContext';
import { CartContext, CartItem } from './CartContext';
import { Alert } from 'react-native';
import Constants from 'expo-constants';

// Types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type PaymentMethod = 'click' | 'credit-card' | 'cash';

export interface PaymentDetails {
  method: PaymentMethod;
  transactionId?: string;
  status: 'paid' | 'pending' | 'failed';
  amount: number;
}

export interface ShippingAddress {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface BillingAddress {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface DeliveryInfo {
  address: string;
  method: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface TimelineEvent {
  status: string;
  date: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  customer_id: string;
  items: CartItem[];
  shipping_address: ShippingAddress;
  billing_address?: BillingAddress;
  payment_method: PaymentMethod;
  payment_details?: PaymentDetails;
  total: number;
  subtotal: number;
  tax: number;
  shipping_fee: number;
  discount: number;
  created_at: string;
  updated_at: string;
  
  // Mobile app specific fields
  customer: Customer;
  delivery: DeliveryInfo;
  payment: {
    method: string;
    status: string;
  };
  date: string;
  timeline: TimelineEvent[];
  deliveryFee: number;
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
    paymentMethod: PaymentMethod,
    total: number
  ) => Promise<Order | null>;
  getUserOrders: () => Order[];
  getOrder: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<boolean>;
  cancelOrder: (id: string) => Promise<boolean>;
  refreshOrders: () => Promise<void>;
}

// API URL for backend communication
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:4000/api';

export const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, session } = useContext(AuthContext) || {};
  const { clearCart } = useContext(CartContext) || {};

  // Load orders on mount and when user changes
  useEffect(() => {
    if (user) {
      refreshOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  const refreshOrders = async (): Promise<void> => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try API first
      try {
        if (!session?.access_token) throw new Error("No valid session");
        
        const response = await fetch(`${API_URL}/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error("API fetch orders failed");
        
        const ordersData = await response.json();
        
        // Transform data to match our Order interface
        const transformedOrders: Order[] = ordersData.map((order: any) => {
          // Extract customer info
          const customer: Customer = {
            id: order.customer_id,
            name: order.shipping_address.fullName,
            email: order.customer_email || '',
            phone: order.shipping_address.phone || ''
          };
          
          // Create delivery info
          const delivery: DeliveryInfo = {
            address: `${order.shipping_address.streetAddress}, ${order.shipping_address.city}`,
            method: 'Standard Delivery'
          };
          
          // Create payment info
          const payment = {
            method: order.payment_method === 'click' ? 'Click' : 
                   order.payment_method === 'credit-card' ? 'Credit Card' : 'Cash',
            status: order.payment_details?.status === 'paid' ? 'Paid' : 'Pending'
          };
          
          // Create timeline events
          const timeline: TimelineEvent[] = [
            { status: 'Order placed', date: new Date(order.created_at).toLocaleString() }
          ];
          
          // Add status changes to timeline
          if (order.status !== 'pending') {
            timeline.push({ 
              status: 'Order confirmed', 
              date: new Date(order.updated_at).toLocaleString() 
            });
          }
          
          if (order.status === 'shipped' || order.status === 'delivered') {
            timeline.push({ 
              status: 'Order shipped', 
              date: new Date(
                new Date(order.updated_at).getTime() + 3600000
              ).toLocaleString() 
            });
          }
          
          if (order.status === 'delivered') {
            timeline.push({ 
              status: 'Order delivered', 
              date: new Date(
                new Date(order.updated_at).getTime() + 86400000
              ).toLocaleString() 
            });
          }
          
          // Format date for display
          const date = new Date(order.created_at).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          
          return {
            ...order,
            customer,
            delivery,
            payment,
            date,
            timeline,
            deliveryFee: order.shipping_fee
          };
        });
        
        setOrders(transformedOrders);
        
      } catch (apiError) {
        // Fallback to direct query
        console.log("API fetch orders failed, using direct query:", apiError);
        
        const { data, error: supabaseError } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });
        
        if (supabaseError) throw supabaseError;
        
        // Transform data to match our Order interface
        const transformedOrders: Order[] = (data || []).map(order => {
          // Extract customer info
          const shippingAddress = order.shipping_address as unknown as ShippingAddress;
          const customer: Customer = {
            id: order.customer_id,
            name: shippingAddress?.fullName || '',
            email: order.customer_email || '',
            phone: shippingAddress?.phone || ''
          };
          
          // Create delivery info
          const delivery: DeliveryInfo = {
            address: shippingAddress ? 
              `${shippingAddress.streetAddress}, ${shippingAddress.city}` : 
              'No address provided',
            method: 'Standard Delivery'
          };
          
          // Create payment info
          const payment = {
            method: order.payment_method === 'click' ? 'Click' : 
                   order.payment_method === 'credit-card' ? 'Credit Card' : 'Cash',
            status: order.payment_details?.status === 'paid' ? 'Paid' : 'Pending'
          };
          
          // Create timeline events
          const timeline: TimelineEvent[] = [
            { status: 'Order placed', date: new Date(order.created_at).toLocaleString() }
          ];
          
          // Add status changes to timeline
          if (order.status !== 'pending') {
            timeline.push({ 
              status: 'Order confirmed', 
              date: new Date(order.updated_at).toLocaleString() 
            });
          }
          
          if (order.status === 'shipped' || order.status === 'delivered') {
            timeline.push({ 
              status: 'Order shipped', 
              date: new Date(
                new Date(order.updated_at).getTime() + 3600000
              ).toLocaleString() 
            });
          }
          
          if (order.status === 'delivered') {
            timeline.push({ 
              status: 'Order delivered', 
              date: new Date(
                new Date(order.updated_at).getTime() + 86400000
              ).toLocaleString() 
            });
          }
          
          // Format date for display
          const date = new Date(order.created_at).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          
          return {
            ...order,
            customer,
            delivery,
            payment,
            date,
            timeline,
            deliveryFee: order.shipping_fee
          };
        });
        
        setOrders(transformedOrders);
      }
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    items: CartItem[],
    shippingAddress: ShippingAddress,
    billingAddress: BillingAddress | null,
    paymentMethod: PaymentMethod,
    total: number
  ): Promise<Order | null> => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to place an order');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Calculate order values
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping_fee = 15000; // Default shipping fee
      const tax = 0; // Tax calculation if needed
      const discount = 0; // Discount calculation if needed
      
      // Build the order object
      const newOrder = {
        customer_id: user.id,
        customer_email: customerEmail,
        items: items,
        shipping_address: {
          ...shippingAddress,
          phone: customerPhone
        },
        billing_address: billingAddress || shippingAddress,
        payment_method: paymentMethod,
        payment_details: {
          method: paymentMethod,
          status: paymentMethod === 'cash' ? 'pending' : 'paid',
          amount: total
        },
        total,
        subtotal,
        tax,
        shipping_fee,
        discount,
        status: 'pending' as OrderStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Try API first
      try {
        if (!session?.access_token) throw new Error("No valid session");
        
        const response = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newOrder)
        });
        
        if (!response.ok) throw new Error("API create order failed");
        
        const createdOrder = await response.json();
        
        // Transform to match our Order interface with app-specific fields
        const transformedOrder: Order = {
          ...createdOrder,
          customer: {
            id: user.id,
            name: customerName,
            email: customerEmail,
            phone: customerPhone
          },
          delivery: {
            address: `${shippingAddress.streetAddress}, ${shippingAddress.city}`,
            method: 'Standard Delivery'
          },
          payment: {
            method: paymentMethod === 'click' ? 'Click' : 
                   paymentMethod === 'credit-card' ? 'Credit Card' : 'Cash',
            status: paymentMethod === 'cash' ? 'Pending' : 'Paid'
          },
          date: new Date().toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          timeline: [
            { 
              status: 'Order placed', 
              date: new Date().toLocaleString() 
            }
          ],
          deliveryFee: shipping_fee
        };
        
        // Update local state
        setOrders(prev => [transformedOrder, ...prev]);
        
        // Clear cart if order was successful
        if (clearCart) clearCart();
        
        return transformedOrder;
        
      } catch (apiError) {
        // Fallback to direct insert
        console.log("API create order failed, using direct insert:", apiError);
        
        const { data: createdOrder, error: insertError } = await supabase
          .from('orders')
          .insert(newOrder)
          .select()
          .single();
        
        if (insertError) throw insertError;
        
        // Transform to match our Order interface with app-specific fields
        const transformedOrder: Order = {
          ...createdOrder,
          customer: {
            id: user.id,
            name: customerName,
            email: customerEmail,
            phone: customerPhone
          },
          delivery: {
            address: `${shippingAddress.streetAddress}, ${shippingAddress.city}`,
            method: 'Standard Delivery'
          },
          payment: {
            method: paymentMethod === 'click' ? 'Click' : 
                   paymentMethod === 'credit-card' ? 'Credit Card' : 'Cash',
            status: paymentMethod === 'cash' ? 'Pending' : 'Paid'
          },
          date: new Date().toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          timeline: [
            { 
              status: 'Order placed', 
              date: new Date().toLocaleString() 
            }
          ],
          deliveryFee: shipping_fee
        };
        
        // Update local state
        setOrders(prev => [transformedOrder, ...prev]);
        
        // Clear cart if order was successful
        if (clearCart) clearCart();
        
        return transformedOrder;
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Failed to create order');
      Alert.alert('Error', 'Failed to create your order. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserOrders = (): Order[] => {
    if (!user) return [];
    return orders;
  };

  const getOrder = (id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  };

  const updateOrderStatus = async (id: string, status: OrderStatus): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Try API first
      try {
        if (!session?.access_token) throw new Error("No valid session");
        
        const response = await fetch(`${API_URL}/orders/${id}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        });
        
        if (!response.ok) throw new Error("API update order status failed");
        
      } catch (apiError) {
        // Fallback to direct update
        console.log("API update order status failed, using direct update:", apiError);
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        
        if (updateError) throw updateError;
      }
      
      // Update the order in local state
      setOrders(prev => prev.map(order => {
        if (order.id === id) {
          // Create new timeline event based on status
          const newEvent = {
            status: 
              status === 'processing' ? 'Order confirmed' :
              status === 'shipped' ? 'Order shipped' :
              status === 'delivered' ? 'Order delivered' :
              status === 'cancelled' ? 'Order cancelled' : 
              'Status updated',
            date: new Date().toLocaleString()
          };
          
          // Add new timeline event if it doesn't already exist
          const timeline = [...order.timeline];
          if (!timeline.some(event => event.status === newEvent.status)) {
            timeline.push(newEvent);
          }
          
          return {
            ...order,
            status,
            updated_at: new Date().toISOString(),
            timeline
          };
        }
        return order;
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (id: string): Promise<boolean> => {
    return updateOrderStatus(id, 'cancelled');
  };

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      error,
      createOrder,
      getUserOrders,
      getOrder,
      updateOrderStatus,
      cancelOrder,
      refreshOrders
    }}>
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