import React, { createContext, useState, useEffect } from 'react';
import { Session, User, AuthError, createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

// Get Supabase configuration from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://bcblhwcluxpxypvomjcr.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjYmxod2NsdXhweHlwdm9tamNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTgxMTAsImV4cCI6MjA2NTQzNDExMH0';

// Create a custom Supabase client for React Native
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  phone: string | null;
  plan: 'free' | 'premium';
  max_stores: number;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API URL for mobile backend communication
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:4000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Clear user data on sign out
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Create a basic profile from user metadata
        const basicProfile: UserProfile = {
          id: user.id,
          full_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: user.user_metadata.role || 'user',
          avatar_url: null,
          phone: null,
          plan: user.user_metadata.plan || 'free',
          max_stores: user.user_metadata.max_stores || 1
        };
        
        setIsAdmin(user.user_metadata.role === 'admin');
        setProfile(basicProfile);

        try {
          // Try to fetch profile from backend API
          const { session } = (await supabase.auth.getSession()).data;
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${session?.access_token || ''}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const apiProfile = await response.json();
            setProfile({
              id: apiProfile.id,
              full_name: apiProfile.full_name,
              email: apiProfile.email || user.email || '',
              role: apiProfile.role,
              avatar_url: apiProfile.avatar_url,
              phone: apiProfile.phone,
              plan: apiProfile.plan || 'free',
              max_stores: apiProfile.max_stores || 1
            });
            setIsAdmin(apiProfile.role === 'admin');
          } else {
            // Fallback to direct database query
            const { data: profileData } = await supabase
              .from('profiles')
              .select()
              .eq('id', user.id)
              .single();
              
            if (profileData) {
              setProfile({
                ...basicProfile,
                full_name: profileData.full_name,
                role: profileData.role,
                avatar_url: profileData.avatar_url,
                phone: profileData.phone,
                plan: profileData.plan || 'free',
                max_stores: profileData.max_stores || 1
              });
              setIsAdmin(profileData.role === 'admin');
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } catch (error) {
        console.error('Error in profile fetch process:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const signUp = async (email: string, password: string, fullName: string, role: string = 'user') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            created_at: new Date().toISOString()
          },
        },
      });

      if (error) {
        Alert.alert('Error', error.message);
        return { error };
      }

      if (data.user) {
        // Create profile immediately after signup
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: role,
            created_at: new Date().toISOString(),
            plan: 'free',
            max_stores: 1
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          Alert.alert('Warning', 'Account created but profile setup failed');
        } else {
          Alert.alert('Success', 'Registration successful! Please check your email to confirm your account.');
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error during sign up:', error);
      Alert.alert('Error', 'An unexpected error occurred during sign up');
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Error', error.message);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error during sign in:', error);
      Alert.alert('Error', 'An unexpected error occurred during sign in');
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
      Alert.alert('Error', 'An error occurred during sign out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        Alert.alert('Error', error.message);
        return { error };
      }

      Alert.alert('Success', 'Password reset instructions sent to your email');
      return { error: null };
    } catch (error) {
      console.error('Error during password reset:', error);
      Alert.alert('Error', 'An unexpected error occurred');
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Try to update through API first
      try {
        const { session } = (await supabase.auth.getSession()).data;
        if (!session) throw new Error('No active session');
        
        const response = await fetch(`${API_URL}/auth/me`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error('Failed to update profile via API');
        }
        
        const apiProfile = await response.json();
        setProfile(prev => prev ? { ...prev, ...apiProfile } : apiProfile);
        setIsAdmin(apiProfile.role === 'admin');
        return { error: null };
      } catch (apiError) {
        console.warn('API update failed, falling back to direct update:', apiError);
        
        // Always update user metadata
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            full_name: data.full_name,
            role: data.role
          }
        });

        if (metadataError) {
          console.warn('Error updating user metadata:', metadataError);
        }
        
        // Try to update the profiles table
        if (data.full_name || data.role || data.avatar_url || data.phone) {
          const updates = {
            id: user.id,
            full_name: data.full_name || profile?.full_name || '',
            role: data.role || profile?.role || 'user',
            avatar_url: data.avatar_url,
            phone: data.phone,
            updated_at: new Date().toISOString()
          };

          const { error: dbError } = await supabase
            .from('profiles')
            .upsert(updates);

          if (dbError) {
            throw new Error('Could not update profile in database');
          }
        }
        
        // Update local state
        setProfile(prev => prev ? { ...prev, ...data } : null);
        if (data.role === 'admin') {
          setIsAdmin(true);
        } else if (data.role === 'user') {
          setIsAdmin(false);
        }
      }
      
      Alert.alert('Success', 'Profile updated successfully');
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      isLoading,
      isAuthenticated: !!user,
      isAdmin,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};