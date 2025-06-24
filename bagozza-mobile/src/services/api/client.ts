import { Session } from '@supabase/supabase-js';
import { supabase } from '../../context/AuthContext';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:4000/api';

/**
 * API client wrapper that automatically adds authentication token to requests
 */
export const apiClient = {
  /**
   * Get current session token
   */
  async getToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  },

  /**
   * Send a GET request to the API
   */
  async get<T>(endpoint: string): Promise<T> {
    const token = await this.getToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const error = new Error(
        errorData?.error || `API request failed with status ${response.status}`
      );
      throw error;
    }
    
    return await response.json();
  },
  
  /**
   * Send a POST request to the API
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const token = await this.getToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const error = new Error(
        errorData?.error || `API request failed with status ${response.status}`
      );
      throw error;
    }
    
    if (response.status === 204) {
      return {} as T; // No content response
    }
    
    return await response.json();
  },
  
  /**
   * Send a PUT request to the API
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    const token = await this.getToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const error = new Error(
        errorData?.error || `API request failed with status ${response.status}`
      );
      throw error;
    }
    
    return await response.json();
  },
  
  /**
   * Send a DELETE request to the API
   */
  async delete(endpoint: string): Promise<void> {
    const token = await this.getToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const error = new Error(
        errorData?.error || `API request failed with status ${response.status}`
      );
      throw error;
    }
  },
};