import { Database } from '../../types/supabase';
import { supabase } from './index';

export type Store = Database['public']['Tables']['stores']['Row'];
export type NewStore = Database['public']['Tables']['stores']['Insert'];

// Fetch all stores
export const getAllStores = async (): Promise<Store[]> => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
};

// Fetch a single store by ID
export const getStoreById = async (id: string): Promise<Store> => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching store ${id}:`, error);
    throw error;
  }
};

// Fetch stores by owner ID
export const getStoresByOwnerId = async (ownerId: string): Promise<Store[]> => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', ownerId);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching stores for owner ${ownerId}:`, error);
    throw error;
  }
};

// Create a new store
export const createStore = async (store: NewStore): Promise<Store> => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .insert(store)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating store:', error);
    throw error;
  }
};

// Update an existing store
export const updateStore = async (id: string, store: Partial<Store>): Promise<Store> => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .update(store)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error updating store ${id}:`, error);
    throw error;
  }
};

// Delete a store
export const deleteStore = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting store ${id}:`, error);
    throw error;
  }
};