import { Database } from '../../types/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export type Store = Database['public']['Tables']['stores']['Row'];
export type NewStore = Database['public']['Tables']['stores']['Insert'];

// Fetch all stores
export const getAllStores = async (): Promise<Store[]> => {
  try {
    const response = await fetch(`${API_URL}/stores`);
    if (!response.ok) {
      throw new Error('Failed to fetch stores');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
};

// Fetch a single store by ID
export const getStoreById = async (id: string): Promise<Store> => {
  try {
    const response = await fetch(`${API_URL}/stores/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch store');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching store ${id}:`, error);
    throw error;
  }
};

// Fetch stores by owner ID
export const getStoresByOwnerId = async (ownerId: string): Promise<Store[]> => {
  try {
    const response = await fetch(`${API_URL}/stores/owner/${ownerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch owner stores');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching stores for owner ${ownerId}:`, error);
    throw error;
  }
};

// Create a new store
export const createStore = async (store: NewStore): Promise<Store> => {
  try {
    const response = await fetch(`${API_URL}/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(store),
    });
    if (!response.ok) {
      throw new Error('Failed to create store');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating store:', error);
    throw error;
  }
};

// Update an existing store
export const updateStore = async (id: string, store: Partial<Store>): Promise<Store> => {
  try {
    const response = await fetch(`${API_URL}/stores/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(store),
    });
    if (!response.ok) {
      throw new Error('Failed to update store');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error updating store ${id}:`, error);
    throw error;
  }
};

// Delete a store
export const deleteStore = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/stores/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete store');
    }
  } catch (error) {
    console.error(`Error deleting store ${id}:`, error);
    throw error;
  }
};