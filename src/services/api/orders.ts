import { Database } from '../../types/supabase';
import { supabase } from './index';

export type Order = Database['public']['Tables']['orders']['Row'];
export type NewOrder = Database['public']['Tables']['orders']['Insert'];

// Fetch all orders
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Fetch a single order by ID
export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

// Fetch orders by customer ID
export const getOrdersByCustomerId = async (customerId: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching orders for customer ${customerId}:`, error);
    throw error;
  }
};

// Fix order fetching with better error handling
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('No authenticated user for fetching orders');
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchOrders:', error);
    return [];
  }
};

// Create a new order
export const createOrder = async (order: NewOrder): Promise<Order> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User must be authenticated to create orders');
    }

    // Ensure customer_id is set
    const orderData = {
      ...order,
      customer_id: order.customer_id || session.user.id,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createOrder:', error);
    return null;
  }
};

// Update an existing order
export const updateOrder = async (id: string, updates: Partial<Order>): Promise<Order | null> => {
  try {
    if (!id) {
      throw new Error('Order ID is required');
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating order ${id}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error in updateOrder for ${id}:`, error);
    return null;
  }
};

// Delete an order
export const deleteOrder = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting order ${id}:`, error);
    throw error;
  }
};