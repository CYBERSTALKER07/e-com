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

// Fix: Add function to get current user's stores specifically
export const getUserStores = async (): Promise<Store[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.warn('No authenticated user for fetching stores');
      return [];
    }

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user stores:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserStores:', error);
    return [];
  }
};

// Keep existing getStoresByOwnerId but ensure it validates ownership
export const getStoresByOwnerId = async (ownerId: string): Promise<Store[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if user is trying to access their own stores or if they're admin
    if (session?.user?.id !== ownerId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session?.user?.id)
        .single();
        
      if (profile?.role !== 'admin') {
        throw new Error('Access denied: You can only view your own stores');
      }
    }

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    
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
export const createStore = async (store: NewStore): Promise<Store | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User must be authenticated to create stores');
    }

    // Only include fields that actually exist in your stores table schema
    const storeData = {
      name: store.name,
      description: store.description || null,
      owner_id: store.owner_id || session.user.id,
      is_active: true
      // Removed contact_email, contact_phone as they don't exist in schema
    };

    // Validate required fields
    if (!storeData.name) {
      throw new Error('Store name is required');
    }

    console.log('Creating store with clean data:', JSON.stringify(storeData));

    const { data, error } = await supabase
      .from('stores')
      .insert(storeData)
      .select()
      .single();

    if (error) {
      console.error('Store creation error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating store:', error);
    // Return null instead of throwing to avoid crashing the application
    return null;
  }
};

// Update an existing store
export const updateStore = async (id: string, updates: Partial<Store>): Promise<Store | null> => {
  try {
    if (!id) {
      throw new Error('Store ID is required');
    }

    const { data, error } = await supabase
      .from('stores')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating store ${id}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error in updateStore for ${id}:`, error);
    return null;
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