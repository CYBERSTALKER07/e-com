import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Use Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

// Create a strong singleton implementation with a guaranteed single instance
class SupabaseClientSingleton {
  private static instance: ReturnType<typeof createClient<Database>> | null = null;
  
  private constructor() {}
  
  public static getInstance(): ReturnType<typeof createClient<Database>> {
    if (!SupabaseClientSingleton.instance) {
      SupabaseClientSingleton.instance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          storageKey: 'bagozza-auth-storage-key',
        }
      });
    }
    
    return SupabaseClientSingleton.instance;
  }
}

export const supabase = SupabaseClientSingleton.getInstance();

// Important: Always import the supabase instance from this file
// Do not create new instances with createClient() elsewhere