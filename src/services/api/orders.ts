import { Database } from '../../types/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export type Order = Database['public']['Tables']['orders']['Row'];
export type NewOrder = Database['public']['Tables']['orders']['Insert'];

// Fetch all orders
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Fetch a single order by ID
export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

// Fetch orders by customer ID
export const getOrdersByCustomerId = async (customerId: string): Promise<Order[]> => {
  try {
    const response = await fetch(`${API_URL}/orders/customer/${customerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch customer orders');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching orders for customer ${customerId}:`, error);
    throw error;
  }
};

// Create a new order
export const createOrder = async (order: NewOrder): Promise<Order> => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      throw new Error('Failed to create order');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Update an existing order
export const updateOrder = async (id: string, order: Partial<Order>): Promise<Order> => {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      throw new Error('Failed to update order');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    throw error;
  }
};

// Delete an order
export const deleteOrder = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete order');
    }
  } catch (error) {
    console.error(`Error deleting order ${id}:`, error);
    throw error;
  }
};