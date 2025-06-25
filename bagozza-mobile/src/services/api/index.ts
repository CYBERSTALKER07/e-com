import Constants from 'expo-constants';
import { supabase } from '../../lib/supabase';

// Get API URL from Expo config - should match web app API URL
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://bagozza-server.onrender.com/api';

// Generic API response type to match web app pattern
export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
}

// Common headers for all requests
async function getHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': data.session ? `Bearer ${data.session.access_token}` : '',
  };
}

// API methods that match the web app's API service
export const api = {
  // Products API
  products: {
    getAll: async (): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/products`, {
          headers: await getHeaders(),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to fetch products', 
          status: 500
        };
      }
    },
    
    getById: async (id: string): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/products/${id}`, {
          headers: await getHeaders(),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to fetch product', 
          status: 500
        };
      }
    },
    
    create: async (product: any): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: await getHeaders(),
          body: JSON.stringify(product),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to create product', 
          status: 500
        };
      }
    },
    
    update: async (id: string, product: any): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/products/${id}`, {
          method: 'PUT',
          headers: await getHeaders(),
          body: JSON.stringify(product),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to update product', 
          status: 500
        };
      }
    },
    
    delete: async (id: string): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/products/${id}`, {
          method: 'DELETE',
          headers: await getHeaders(),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to delete product', 
          status: 500
        };
      }
    },
  },
  
  // Orders API
  orders: {
    getAll: async (): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/orders`, {
          headers: await getHeaders(),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to fetch orders', 
          status: 500
        };
      }
    },
    
    getById: async (id: string): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/orders/${id}`, {
          headers: await getHeaders(),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to fetch order', 
          status: 500
        };
      }
    },
    
    create: async (order: any): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: await getHeaders(),
          body: JSON.stringify(order),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to create order', 
          status: 500
        };
      }
    },
    
    update: async (id: string, status: string): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/orders/${id}/status`, {
          method: 'PUT',
          headers: await getHeaders(),
          body: JSON.stringify({ status }),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to update order status', 
          status: 500
        };
      }
    },
  },
  
  // Store API
  stores: {
    getAll: async (): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/stores`, {
          headers: await getHeaders(),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to fetch stores', 
          status: 500
        };
      }
    },
    
    getById: async (id: string): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/stores/${id}`, {
          headers: await getHeaders(),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to fetch store', 
          status: 500
        };
      }
    },
    
    create: async (store: any): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/stores`, {
          method: 'POST',
          headers: await getHeaders(),
          body: JSON.stringify(store),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to create store', 
          status: 500
        };
      }
    },
    
    update: async (id: string, store: any): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/stores/${id}`, {
          method: 'PUT',
          headers: await getHeaders(),
          body: JSON.stringify(store),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to update store', 
          status: 500
        };
      }
    },
    
    delete: async (id: string): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/stores/${id}`, {
          method: 'DELETE',
          headers: await getHeaders(),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to delete store', 
          status: 500
        };
      }
    },
    
    getUserStores: async (): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/stores/user`, {
          headers: await getHeaders(),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to fetch user stores', 
          status: 500
        };
      }
    },
  },
  
  // Auth API
  auth: {
    getProfile: async (): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: await getHeaders(),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to fetch profile', 
          status: 500
        };
      }
    },
    
    updateProfile: async (profileData: any): Promise<ApiResponse> => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: 'PUT',
          headers: await getHeaders(),
          body: JSON.stringify(profileData),
        });
        const data = await response.json();
        return { data, error: null, status: response.status };
      } catch (error) {
        console.error('API error:', error);
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Failed to update profile', 
          status: 500
        };
      }
    },
  }
};

export default api;