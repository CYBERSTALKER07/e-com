// Add RN URL polyfill before anything else
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { AppState } from 'react-native';

// Replace manifest extra lookup with a unified expoConfig
const expoConfig = (Constants.manifest as any) ?? (Constants.expoConfig as any);
const { supabaseUrl, supabaseAnonKey } = expoConfig.extra as {
  supabaseUrl: string;
  supabaseAnonKey: string;
};
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration in app.json.');
}

// Create a custom Supabase client for React Native with persistent storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auto-refresh setup for Supabase Auth
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default supabase;