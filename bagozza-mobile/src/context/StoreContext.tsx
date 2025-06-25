import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from './AuthContext';
import { AuthContext } from './AuthContext';
import { Alert } from 'react-native';
import Constants from 'expo-constants';

// Types
export interface Store {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  metrics?: StoreMetrics;
}

export interface StoreMetrics {
  total_products: number;
  total_orders: number;
  pending_orders: number;
  revenue: number;
}

export interface CreateStoreDTO {
  name: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
}

export interface UpdateStoreDTO extends Partial<CreateStoreDTO> {
  is_active?: boolean;
}

interface StoreContextType {
  userStores: Store[];
  selectedStore: Store | null;
  loading: boolean;
  storeMetrics: Record<string, StoreMetrics>;
  fetchStoreMetrics: (storeId: string) => Promise<void>;
  selectStore: (store: Store | null) => void;
  createStore: (data: CreateStoreDTO) => Promise<Store | null>;
  updateStore: (id: string, data: UpdateStoreDTO) => Promise<boolean>;
  deleteStore: (id: string) => Promise<boolean>;
}

// API URL for backend communication
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:4000/api';

// Create context
export const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userStores, setUserStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [storeMetrics, setStoreMetrics] = useState<Record<string, StoreMetrics>>({});
  
  const { user, session } = useContext(AuthContext) || {};

  useEffect(() => {
    if (user) {
      fetchUserStores();
    } else {
      setUserStores([]);
      setSelectedStore(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserStores = async () => {
    setLoading(true);
    try {
      // Try to fetch via API
      try {
        if (!session?.access_token) throw new Error("No valid session");
        
        const response = await fetch(`${API_URL}/stores/my-stores`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error("API request failed");
        
        const storesData = await response.json();
        setUserStores(storesData);
        
        // If no store is selected but we have stores, select the first one
        if (!selectedStore && storesData.length > 0) {
          setSelectedStore(storesData[0]);
        }
        
      } catch (apiError) {
        // Fallback to direct Supabase query
        console.log("Falling back to direct Supabase query:", apiError);
        
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', user?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setUserStores(data || []);
        
        // If no store is selected but we have stores, select the first one
        if (!selectedStore && data && data.length > 0) {
          setSelectedStore(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching user stores:", error);
      Alert.alert("Error", "Failed to load your stores");
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreMetrics = async (storeId: string) => {
    try {
      // Try API first
      try {
        if (!session?.access_token) throw new Error("No valid session");
        
        const response = await fetch(`${API_URL}/stores/${storeId}/metrics`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error("API metrics request failed");
        
        const metrics = await response.json();
        setStoreMetrics(prev => ({
          ...prev,
          [storeId]: metrics
        }));
        
      } catch (apiError) {
        // Fallback calculations via direct queries
        console.log("Falling back to direct metrics calculation:", apiError);

        // Get products count
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('id', { count: 'exact' })
          .eq('store_id', storeId);

        // Get orders containing products from this store
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .contains('items', [{ product: { store_id: storeId } }]);

        if (productsError || ordersError) {
          throw new Error("Error fetching metrics data");
        }

        // Calculate metrics
        const metrics: StoreMetrics = {
          total_products: productsCount || 0,
          total_orders: orders?.length || 0,
          pending_orders: orders?.filter(order => order.status === 'pending').length || 0,
          revenue: orders?.reduce((sum, order) => {
            // Calculate revenue from this store's products in each order
            const storeItems = (order.items || []).filter((item: any) => 
              item.product && item.product.store_id === storeId
            );
            
            const orderRevenue = storeItems.reduce((itemSum: number, item: any) => 
              itemSum + (item.price * item.quantity), 0
            );
            
            return sum + orderRevenue;
          }, 0) || 0
        };

        setStoreMetrics(prev => ({
          ...prev,
          [storeId]: metrics
        }));
      }
    } catch (error) {
      console.error("Error fetching store metrics:", error);
      Alert.alert("Error", "Could not load store metrics");
    }
  };

  const selectStore = (store: Store | null) => {
    setSelectedStore(store);
    if (store) {
      fetchStoreMetrics(store.id);
    }
  };

  const createStore = async (data: CreateStoreDTO): Promise<Store | null> => {
    try {
      if (!user) {
        throw new Error("You must be logged in to create a store");
      }

      // First check if user has reached their store limit
      const { data: profile } = await supabase
        .from('profiles')
        .select('max_stores')
        .eq('id', user.id)
        .single();

      const maxStores = profile?.max_stores || 1;
      
      if (userStores.length >= maxStores) {
        Alert.alert(
          "Store Limit Reached", 
          `You can only create ${maxStores} store${maxStores !== 1 ? 's' : ''} on your current plan.`
        );
        return null;
      }

      // Prepare the new store data
      const newStore = {
        ...data,
        owner_id: user.id,
        is_active: true,
        created_at: new Date().toISOString()
      };

      // Try API first
      try {
        if (!session?.access_token) throw new Error("No valid session");
        
        const response = await fetch(`${API_URL}/stores`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newStore)
        });
        
        if (!response.ok) throw new Error("Failed to create store via API");
        
        const createdStore = await response.json();
        setUserStores(prev => [createdStore, ...prev]);
        setSelectedStore(createdStore);
        
        return createdStore;
        
      } catch (apiError) {
        // Fallback to direct insert
        console.log("API store creation failed, using direct insert:", apiError);
        
        const { data: createdStore, error } = await supabase
          .from('stores')
          .insert(newStore)
          .select()
          .single();

        if (error) throw error;

        // Update local state
        setUserStores(prev => [createdStore, ...prev]);
        setSelectedStore(createdStore);
        
        return createdStore;
      }
    } catch (error) {
      console.error("Error creating store:", error);
      Alert.alert("Error", "Failed to create store");
      return null;
    }
  };

  const updateStore = async (id: string, data: UpdateStoreDTO): Promise<boolean> => {
    try {
      // Try API first
      try {
        if (!session?.access_token) throw new Error("No valid session");
        
        const response = await fetch(`${API_URL}/stores/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error("API update failed");
        
        const updatedStore = await response.json();
        
        // Update local states
        setUserStores(prev => prev.map(store => 
          store.id === id ? { ...store, ...updatedStore } : store
        ));
        
        if (selectedStore?.id === id) {
          setSelectedStore(prev => prev ? { ...prev, ...updatedStore } : null);
        }
        
        return true;
        
      } catch (apiError) {
        console.log("API store update failed, using direct update:", apiError);
        
        // Fallback to direct update
        const { error } = await supabase
          .from('stores')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;

        // Update local states
        setUserStores(prev => prev.map(store => 
          store.id === id ? { ...store, ...data } : store
        ));
        
        if (selectedStore?.id === id) {
          setSelectedStore(prev => prev ? { ...prev, ...data } : null);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error updating store:", error);
      Alert.alert("Error", "Failed to update store");
      return false;
    }
  };

  const deleteStore = async (id: string): Promise<boolean> => {
    try {
      // Try API first
      try {
        if (!session?.access_token) throw new Error("No valid session");
        
        const response = await fetch(`${API_URL}/stores/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (!response.ok) throw new Error("API delete failed");
        
      } catch (apiError) {
        console.log("API store deletion failed, using direct delete:", apiError);
        
        // Fallback to direct delete
        const { error } = await supabase
          .from('stores')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      // Update local state
      setUserStores(prev => prev.filter(store => store.id !== id));
      
      // If deleted store was selected, select another one if available
      if (selectedStore?.id === id) {
        const remainingStores = userStores.filter(store => store.id !== id);
        setSelectedStore(remainingStores.length > 0 ? remainingStores[0] : null);
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting store:", error);
      Alert.alert("Error", "Failed to delete store");
      return false;
    }
  };

  return (
    <StoreContext.Provider value={{
      userStores,
      selectedStore,
      loading,
      storeMetrics,
      fetchStoreMetrics,
      selectStore,
      createStore,
      updateStore,
      deleteStore
    }}>
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