import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the same configuration as the web app
const supabaseUrl = 'https://bcblhwcluxpxypvomjcr.supabase.co';
const supabaseAnonKey = 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjYmxod2NsdXhweHlwdm9tamNyIiwicm9zZSI6ImFub24iLCJpYXQiOjE3NDk4NTgxMTAsImV4cCI6MjA2NTQzNDExMH0';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;