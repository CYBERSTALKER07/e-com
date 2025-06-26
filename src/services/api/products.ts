import { Database } from '../../types/supabase';
import { supabase } from '../../lib/supabase';
import { withRetry, withFallback } from './utils';

export type Product = Database['public']['Tables']['products']['Row'];
export type NewProduct = Database['public']['Tables']['products']['Insert'];

// Fetch all products
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return []; // Return empty array as fallback
  }
};

// Fetch a single product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      // Handle not found error gracefully
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

// Fetch products by store ID
export const getProductsByStoreId = async (storeId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching products for store ${storeId}:`, error);
    return [];
  }
};

// Create a new product
export const createProduct = async (product: NewProduct): Promise<Product | null> => {
  try {
    if (!product.store_id) {
      throw new Error('Product must have a store_id');
    }

    // Check for existing session to handle auth issues
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('User must be authenticated to create products');
    }

    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) {
      // Add more context to authentication errors
      if (error.code === '42501') {
        throw new Error('Permission denied: You do not have rights to create products for this store');
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
};

// Update an existing product
export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product | null> => {
  try {
    // Check for existing session to handle auth issues
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('User must be authenticated to update products');
    }
    
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      // Add more context to authentication errors
      if (error.code === '42501') {
        throw new Error('Permission denied: You do not have rights to update this product');
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    return null;
  }
};

// Delete a product
export const deleteProduct = async (id: string, options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  refreshData?: boolean;
}): Promise<{ success: boolean; error?: any }> => {
  try {
    if (!id) {
      throw new Error('Product ID is required');
    }

    // Check for existing session to handle auth issues
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('User must be authenticated to delete products');
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      if (error.code === '42501') {
        throw new Error('Permission denied: You do not have rights to delete this product');
      }
      console.error(`Error deleting product ${id}:`, error);
      options?.onError?.(error);
      return { success: false, error };
    }
    
    // Call success callback if provided
    options?.onSuccess?.();
    
    // Return success
    return { success: true };
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    options?.onError?.(error);
    return { success: false, error };
  }
};