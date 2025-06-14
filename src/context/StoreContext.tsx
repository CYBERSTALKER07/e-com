import React, { createContext, useContext, useState, useEffect } from 'react';
import { Store, CreateStoreDTO, UpdateStoreDTO } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface StoreContextType {
  stores: Store[];
  userStores: Store[];
  loading: boolean;
  createStore: (data: CreateStoreDTO) => Promise<Store | null>;
  updateStore: (data: UpdateStoreDTO) => Promise<Store | null>;
  deleteStore: (id: string) => Promise<boolean>;
  getStoreById: (id: string) => Store | undefined;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch all active stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setStores(data || []);
      } catch (error) {
        console.error('Error fetching stores:', error);
        toast.error('Failed to load stores');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();

    // Subscribe to changes
    const subscription = supabase
      .channel('stores')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stores' }, fetchStores)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const userStores = stores.filter(store => store.owner_id === user?.id);

  const createStore = async (data: CreateStoreDTO): Promise<Store | null> => {
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create a store');
        return null;
      }

      const { data: existingStore, error: existingError } = await supabase
        .from('stores')
        .select('id')
        .eq('name', data.name)
        .single();

      if (existingStore) {
        toast.error('A store with this name already exists');
        return null;
      }

      const { data: store, error } = await supabase
        .from('stores')
        .insert({
          name: data.name,
          description: data.description,
          owner_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Store creation error:', error);
        if (error.code === '42501') {
          toast.error('You do not have permission to create a store');
        } else if (error.code === '23505') {
          toast.error('A store with this name already exists');
        } else {
          toast.error('Failed to create store');
        }
        return null;
      }

      toast.success('Store created successfully');
      // Update local stores state
      setStores(prevStores => [...prevStores, store]);
      return store;
    } catch (error) {
      console.error('Error creating store:', error);
      toast.error('Failed to create store');
      return null;
    }
  };

  const updateStore = async (data: UpdateStoreDTO): Promise<Store | null> => {
    try {
      const { data: store, error } = await supabase
        .from('stores')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Store updated successfully');
      return store;
    } catch (error) {
      console.error('Error updating store:', error);
      toast.error('Failed to update store');
      return null;
    }
  };

  const deleteStore = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Store deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting store:', error);
      toast.error('Failed to delete store');
      return false;
    }
  };

  const getStoreById = (id: string) => stores.find(store => store.id === id);

  return (
    <StoreContext.Provider
      value={{
        stores,
        userStores,
        loading,
        createStore,
        updateStore,
        deleteStore,
        getStoreById,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};