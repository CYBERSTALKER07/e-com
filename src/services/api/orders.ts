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

// Create a new order
export const createOrder = async (order: NewOrder): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Update an existing order
export const updateOrder = async (id: string, order: Partial<Order>): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update(order)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    throw error;
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