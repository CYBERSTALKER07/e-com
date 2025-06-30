import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAllStores, 
  getStoreById,
  getStoresByOwnerId,
  getUserStores,
  createStore,
  updateStore,
  deleteStore,
  Store 
} from '../services/api/stores';
import { useAuth } from '../hooks/useAuth';

interface StoreContextType {
  stores: Store[];
  selectedStore: Store | null;
  loading: boolean;
  error: string | null;
  fetchStores: () => Promise<void>;
  fetchStoreById: (id: string) => Promise<Store | null>;
  fetchStoresByOwner: (ownerId: string) => Promise<Store[]>;
  addStore: (store: Omit<Store, 'id' | 'created_at' | 'updated_at'>) => Promise<Store | null>;
  editStore: (id: string, store: Partial<Store>) => Promise<Store | null>;
  removeStore: (id: string) => Promise<boolean>;
  selectStore: (store: Store | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchUserStores();
    } else {
      // Clear stores when user logs out
      setStores([]);
      setSelectedStore(null);
    }
  }, [user]);

  // Use the new getUserStores function
  const fetchUserStores = async () => {
    if (!user?.id) {
      setStores([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const userStores = await getUserStores();
      setStores(userStores);
      
      // If no store is selected but user has stores, select the first one
      if (!selectedStore && userStores.length > 0) {
        setSelectedStore(userStores[0]);
      }
    } catch (err) {
      setError('Failed to fetch your stores');
      console.error('Failed to fetch user stores:', err);
    } finally {
      setLoading(false);
    }
  };

  // Also update the fetchStores method to use getUserStores
  const fetchStores = async () => {
    if (!user?.id) {
      console.warn('No user ID available for fetching stores');
      setStores([]);
      return [];
    }
    
    try {
      setLoading(true);
      setError(null);
      const fetchedStores = await getUserStores();
      setStores(fetchedStores);
      return fetchedStores;
    } catch (err) {
      setError('Failed to fetch your stores');
      console.error('Failed to fetch user stores:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const store = await getStoreById(id);
      return store;
    } catch (err) {
      setError(`Failed to fetch store ${id}`);
      console.error(`Failed to fetch store ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchStoresByOwner = async (ownerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const fetchedStores = await getStoresByOwnerId(ownerId);
      return fetchedStores;
    } catch (err) {
      setError(`Failed to fetch stores for owner ${ownerId}`);
      console.error(`Failed to fetch stores for owner ${ownerId}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addStore = async (storeData: Omit<Store, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure owner_id is set to current user
      const newStoreData = {
        ...storeData,
        owner_id: user?.id
      };
      
      const newStore = await createStore(newStoreData as any);
      if (newStore) {
        setStores(prevStores => [newStore, ...prevStores]);
        // Auto-select the new store
        setSelectedStore(newStore);
      }
      return newStore;
    } catch (err) {
      setError('Failed to create store');
      console.error('Failed to create store:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const editStore = async (id: string, storeData: Partial<Store>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedStore = await updateStore(id, storeData);
      setStores(prevStores => 
        prevStores.map(store => 
          store.id === id ? updatedStore : store
        )
      );
      
      // If the updated store is the selected store, update it too
      if (selectedStore?.id === id) {
        setSelectedStore(updatedStore);
      }
      
      return updatedStore;
    } catch (err) {
      setError(`Failed to update store ${id}`);
      console.error(`Failed to update store ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeStore = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteStore(id);
      setStores(prevStores => prevStores.filter(store => store.id !== id));
      
      // If the deleted store is the selected store, clear selection
      if (selectedStore?.id === id) {
        setSelectedStore(null);
      }
      
      return true;
    } catch (err) {
      setError(`Failed to delete store ${id}`);
      console.error(`Failed to delete store ${id}:`, err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const selectStore = (store: Store | null) => {
    setSelectedStore(store);
  };

  const value = {
    stores,
    selectedStore,
    loading,
    error,
    fetchStores: fetchUserStores, // Use the user-specific fetch method
    fetchStoreById,
    fetchStoresByOwner,
    addStore,
    editStore,
    removeStore,
    selectStore,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};