import Constants from 'expo-constants';
import { supabase } from '../../context/AuthContext';

// Get API URL from Expo config
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://bagozza-server.onrender.com/api';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  
  return {
    'Content-Type': 'application/json',
    'Authorization': session ? `Bearer ${session.access_token}` : '',
  };
}

export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/${endpoint.replace(/^\//, '')}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      // Handle different error status codes
      if (response.status === 401) {
        return { data: null, error: 'Unauthorized: Please log in again' };
      } else if (response.status === 404) {
        return { data: null, error: 'Resource not found' };
      }
      
      // Try to parse error message from response
      try {
        const errorData = await response.json();
        return { data: null, error: errorData.message || 'API request failed' };
      } catch {
        return { data: null, error: `API request failed with status ${response.status}` };
      }
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('API request failed:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Network request failed' 
    };
  }
}

export async function post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/${endpoint.replace(/^\//, '')}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { data: null, error: 'Unauthorized: Please log in again' };
      }
      
      try {
        const errorData = await response.json();
        return { data: null, error: errorData.message || 'API request failed' };
      } catch {
        return { data: null, error: `API request failed with status ${response.status}` };
      }
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('API request failed:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Network request failed' 
    };
  }
}

export async function put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/${endpoint.replace(/^\//, '')}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { data: null, error: 'Unauthorized: Please log in again' };
      }
      
      try {
        const errorData = await response.json();
        return { data: null, error: errorData.message || 'API request failed' };
      } catch {
        return { data: null, error: `API request failed with status ${response.status}` };
      }
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('API request failed:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Network request failed' 
    };
  }
}

export async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/${endpoint.replace(/^\//, '')}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { data: null, error: 'Unauthorized: Please log in again' };
      }
      
      try {
        const errorData = await response.json();
        return { data: null, error: errorData.message || 'API request failed' };
      } catch {
        return { data: null, error: `API request failed with status ${response.status}` };
      }
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('API request failed:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Network request failed' 
    };
  }
}

export default {
  get,
  post,
  put,
  delete: del
};