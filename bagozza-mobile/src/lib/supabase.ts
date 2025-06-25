import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { AppState } from 'react-native';

// Get configuration from app.json
const expoConfig = Constants.expoConfig || Constants.manifest;
const { supabaseUrl, supabaseAnonKey } = expoConfig?.extra || {};

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration in app.json');
}

console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Using anon key:', supabaseAnonKey.substring(0, 20) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auto-refresh setup
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default supabase;