import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get Supabase configuration from Expo config
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://bcblhwcluxpxypvomjcr.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjYmxod2NsdXhweHlwdm9tamNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTgxMTAsImV4cCI6MjA2NTQzNDExMH0';

// Create a custom Supabase client for React Native with persistent storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;